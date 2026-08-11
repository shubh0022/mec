import { prisma } from "../config/prisma.js";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductDto,
  CategoryDto,
  WarehouseDto
} from "@vanta/shared";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class ProductService {
  private static async generateProductCode(): Promise<string> {
    const products = await prisma.product.findMany({
      select: { productCode: true }
    });

    let maxNum = 1000;
    for (const p of products) {
      if (p.productCode && p.productCode.startsWith("PRD-")) {
        const num = parseInt(p.productCode.replace("PRD-", ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    return `PRD-${maxNum + 1}`;
  }

  static async getProducts(
    page: number = 1,
    limit: number = 20,
    search?: string,
    categoryId?: string,
    lowStockOnly?: boolean
  ) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { sku: { contains: search } },
        { productCode: { contains: search } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Prisma query
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          warehouse: true
        }
      })
    ]);

    let formattedProducts = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock
    }));

    if (lowStockOnly) {
      formattedProducts = formattedProducts.filter((p) => p.isLowStock);
    }

    return {
      data: formattedProducts as unknown as ProductDto[],
      pagination: {
        page,
        limit,
        total: lowStockOnly ? formattedProducts.length : total,
        totalPages: Math.ceil((lowStockOnly ? formattedProducts.length : total) / limit)
      }
    };
  }

  static async getProductById(id: string): Promise<ProductDto> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        warehouse: true,
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            createdByUser: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minimumStock
    } as unknown as ProductDto;
  }

  static async createProduct(input: CreateProductInput, userId: string): Promise<ProductDto> {
    const skuFormatted = input.sku.trim().toUpperCase();

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: skuFormatted }
    });

    if (existing) {
      throw new ConflictError(`Product with SKU '${skuFormatted}' already exists`);
    }

    const productCode = await this.generateProductCode();

    const product = await prisma.product.create({
      data: {
        productCode,
        productName: input.productName.trim(),
        sku: skuFormatted,
        categoryId: input.categoryId || null,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock ?? 0,
        minimumStock: input.minimumStock ?? 5,
        warehouseId: input.warehouseId || null,
        imageUrl: input.imageUrl || null,
        isActive: input.isActive ?? true
      },
      include: {
        category: true,
        warehouse: true
      }
    });

    // If initial stock is > 0, log an initial stock movement
    if (product.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          movementType: "IN",
          reason: "Initial stock upon product registration",
          referenceType: "INITIAL_STOCK",
          createdBy: userId
        }
      });
    }

    AuditService.logAction({
      userId,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      metadata: { sku: product.sku, name: product.productName }
    }).catch(console.error);

    return {
      ...product,
      isLowStock: product.currentStock <= product.minimumStock
    } as unknown as ProductDto;
  }

  static async updateProduct(id: string, input: UpdateProductInput, userId: string): Promise<ProductDto> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    const updateData: any = {};
    if (input.productName) updateData.productName = input.productName.trim();
    if (input.sku) {
      const skuFormatted = input.sku.trim().toUpperCase();
      if (skuFormatted !== existing.sku) {
        const duplicate = await prisma.product.findUnique({ where: { sku: skuFormatted } });
        if (duplicate) {
          throw new ConflictError(`Product with SKU '${skuFormatted}' already exists`);
        }
        updateData.sku = skuFormatted;
      }
    }
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
    if (input.unitPrice !== undefined) updateData.unitPrice = input.unitPrice;
    if (input.minimumStock !== undefined) updateData.minimumStock = input.minimumStock;
    if (input.warehouseId !== undefined) updateData.warehouseId = input.warehouseId || null;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl || null;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        warehouse: true
      }
    });

    AuditService.logAction({
      userId,
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: updated.id,
      metadata: { fields: Object.keys(updateData) }
    }).catch(console.error);

    return {
      ...updated,
      isLowStock: updated.currentStock <= updated.minimumStock
    } as unknown as ProductDto;
  }

  static async getCategories(): Promise<CategoryDto[]> {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  static async getWarehouses(): Promise<WarehouseDto[]> {
    return prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  }
}
