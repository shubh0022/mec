import { prisma } from "../config/prisma.js";
import {
  CreateStockMovementInput,
  StockMovementDto,
  MovementType
} from "@vanta/shared";
import { InsufficientStockError, NotFoundError } from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class StockService {
  static async getStockMovements(
    page: number = 1,
    limit: number = 20,
    productId?: string,
    movementType?: string,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (movementType) {
      where.movementType = movementType;
    }

    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { referenceType: { contains: search } },
        { product: { productName: { contains: search } } },
        { product: { sku: { contains: search } } }
      ];
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, productCode: true }
          },
          createdByUser: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    return {
      data: movements as unknown as StockMovementDto[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async createStockMovement(
    input: CreateStockMovementInput,
    userId: string
  ): Promise<StockMovementDto> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch product
      const product = await tx.product.findUnique({
        where: { id: input.productId }
      });

      if (!product) {
        throw new NotFoundError(`Product with ID '${input.productId}' not found`);
      }

      // 2. Validate negative stock protection
      if (input.movementType === MovementType.OUT && product.currentStock < input.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for product '${product.productName}' (${product.sku}). Available: ${product.currentStock}, Requested: ${input.quantity}`
        );
      }

      // 3. Compute new stock level
      const newStock =
        input.movementType === MovementType.IN
          ? product.currentStock + input.quantity
          : product.currentStock - input.quantity;

      // 4. Update product currentStock
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newStock }
      });

      // 5. Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: input.quantity,
          movementType: input.movementType,
          reason: input.reason.trim(),
          referenceType: input.referenceType || "MANUAL_ADJUSTMENT",
          referenceId: input.referenceId || null,
          createdBy: userId
        },
        include: {
          product: {
            select: { id: true, productName: true, sku: true, productCode: true }
          },
          createdByUser: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // 6. Record audit action within transaction
      const action = input.movementType === MovementType.IN ? "STOCK_IN" : "STOCK_OUT";
      await tx.auditLog.create({
        data: {
          userId,
          action,
          entity: "Product",
          entityId: product.id,
          metadata: JSON.stringify({
            quantity: input.quantity,
            previousStock: product.currentStock,
            newStock,
            reason: input.reason
          })
        }
      });

      return movement as unknown as StockMovementDto;
    }, { timeout: 10000 });
  }
}
