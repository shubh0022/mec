import { prisma } from "../config/prisma.js";
import {
  CreateSalesChallanInput,
  UpdateSalesChallanInput,
  SalesChallanDto,
  ChallanStatus
} from "@vanta/shared";
import {
  ConflictError,
  InsufficientStockError,
  NotFoundError,
  ValidationError
} from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const date = new Date();
    const yearShort = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `CH-${yearShort}${month}-`;

    const lastChallan = await prisma.salesChallan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { createdAt: "desc" },
      select: { challanNumber: true }
    });

    if (!lastChallan) {
      return `${prefix}001`;
    }

    const currentSeq = parseInt(lastChallan.challanNumber.replace(prefix, ""), 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(3, "0")}`;
  }

  static async getChallans(
    page: number = 1,
    limit: number = 20,
    status?: string,
    customerId?: string,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { customer: { businessName: { contains: search } } }
      ];
    }

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true, customerCode: true, mobile: true }
          },
          createdByUser: {
            select: { id: true, name: true, email: true }
          },
          confirmedByUser: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { id: true, productName: true, sku: true, currentStock: true }
              }
            }
          }
        }
      })
    ]);

    return {
      data: challans as unknown as SalesChallanDto[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getChallanById(id: string): Promise<SalesChallanDto> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdByUser: {
          select: { id: true, name: true, email: true }
        },
        confirmedByUser: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!challan) {
      throw new NotFoundError(`Sales Challan with ID '${id}' not found`);
    }

    return challan as unknown as SalesChallanDto;
  }

  static async createChallan(input: CreateSalesChallanInput, userId: string): Promise<SalesChallanDto> {
    // 1. Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId }
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${input.customerId}' not found`);
    }

    if (input.items.length === 0) {
      throw new ValidationError("At least one product item is required");
    }

    // 2. Fetch product details and prepare snapshots
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemsToCreate = input.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }
      if (item.quantity <= 0) {
        throw new ValidationError(`Quantity for ${prod.productName} must be greater than 0`);
      }

      const lineTotal = item.quantity * prod.unitPrice;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      return {
        productId: prod.id,
        productNameSnapshot: prod.productName,
        skuSnapshot: prod.sku,
        unitPriceSnapshot: prod.unitPrice,
        quantity: item.quantity,
        lineTotal
      };
    });

    const challanNumber = await this.generateChallanNumber();

    // 3. Create challan in DRAFT status
    const challan = await prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: customer.id,
        status: ChallanStatus.DRAFT,
        totalQuantity,
        subTotal: totalAmount,
        totalAmount,
        notes: input.notes?.trim() || null,
        createdBy: userId,
        items: {
          create: itemsToCreate
        }
      },
      include: {
        customer: true,
        createdByUser: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    AuditService.logAction({
      userId,
      action: "CHALLAN_CREATED",
      entity: "SalesChallan",
      entityId: challan.id,
      metadata: { challanNumber: challan.challanNumber, totalAmount, status: challan.status }
    }).catch(console.error);

    return challan as unknown as SalesChallanDto;
  }

  static async updateChallan(
    id: string,
    input: UpdateSalesChallanInput,
    userId: string
  ): Promise<SalesChallanDto> {
    const existing = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) {
      throw new NotFoundError(`Sales Challan with ID '${id}' not found`);
    }

    if (existing.status !== ChallanStatus.DRAFT) {
      throw new ConflictError(`Cannot edit a challan in '${existing.status}' status. Only DRAFT challans can be modified.`);
    }

    return prisma.$transaction(async (tx) => {
      let totalQuantity = existing.totalQuantity;
      let totalAmount = existing.totalAmount;

      if (input.items && input.items.length > 0) {
        // Delete old items
        await tx.salesChallanItem.deleteMany({ where: { challanId: id } });

        const productIds = input.items.map((i) => i.productId);
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map((p) => [p.id, p]));

        totalQuantity = 0;
        totalAmount = 0;

        for (const item of input.items) {
          const prod = productMap.get(item.productId);
          if (!prod) {
            throw new NotFoundError(`Product with ID '${item.productId}' not found`);
          }
          if (item.quantity <= 0) {
            throw new ValidationError(`Quantity for ${prod.productName} must be greater than 0`);
          }

          const lineTotal = item.quantity * prod.unitPrice;
          totalQuantity += item.quantity;
          totalAmount += lineTotal;

          await tx.salesChallanItem.create({
            data: {
              challanId: id,
              productId: prod.id,
              productNameSnapshot: prod.productName,
              skuSnapshot: prod.sku,
              unitPriceSnapshot: prod.unitPrice,
              quantity: item.quantity,
              lineTotal
            }
          });
        }
      }

      const updated = await tx.salesChallan.update({
        where: { id },
        data: {
          ...(input.customerId ? { customerId: input.customerId } : {}),
          ...(input.notes !== undefined ? { notes: input.notes ? input.notes.trim() : null } : {}),
          totalQuantity,
          subTotal: totalAmount,
          totalAmount
        },
        include: {
          customer: true,
          createdByUser: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await AuditService.logAction({
        userId,
        action: "CHALLAN_UPDATED",
        entity: "SalesChallan",
        entityId: updated.id,
        metadata: { challanNumber: updated.challanNumber, totalAmount }
      });

      return updated as unknown as SalesChallanDto;
    });
  }

  /**
   * CRITICAL TRANSACTIONAL BUSINESS LOGIC:
   * 1. Start interactive transaction
   * 2. Lock & check stock for all items
   * 3. If any item has insufficient stock -> abort and rollback with 409 Conflict
   * 4. Deduct stock atomically for all items
   * 5. Create OUT stock movements
   * 6. Mark challan as CONFIRMED with timestamp & confirmedBy
   */
  static async confirmChallan(id: string, userId: string): Promise<SalesChallanDto> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch Challan
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          items: true,
          customer: true
        }
      });

      if (!challan) {
        throw new NotFoundError(`Sales Challan with ID '${id}' not found`);
      }

      if (challan.status === ChallanStatus.CONFIRMED) {
        throw new ConflictError(`Challan '${challan.challanNumber}' is already confirmed.`);
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new ConflictError(`Cannot confirm cancelled Challan '${challan.challanNumber}'.`);
      }

      if (challan.items.length === 0) {
        throw new ValidationError(`Challan '${challan.challanNumber}' contains no items.`);
      }

      // 2. Validate stock for ALL items
      const stockErrors: { sku: string; productName: string; available: number; requested: number }[] = [];
      const productsToUpdate: { product: any; item: any }[] = [];

      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product || !product.isActive) {
          throw new NotFoundError(`Product '${item.productNameSnapshot}' (${item.skuSnapshot}) not found or inactive`);
        }

        if (product.currentStock < item.quantity) {
          stockErrors.push({
            sku: product.sku,
            productName: product.productName,
            available: product.currentStock,
            requested: item.quantity
          });
        } else {
          productsToUpdate.push({ product, item });
        }
      }

      // 3. Rollback immediately if ANY product has insufficient inventory
      if (stockErrors.length > 0) {
        const detail = stockErrors
          .map((e) => `${e.sku} (Available: ${e.available}, Requested: ${e.requested})`)
          .join(", ");
        throw new InsufficientStockError(
          `Insufficient stock for product(s): ${detail}. Challan confirmation rejected.`,
          stockErrors
        );
      }

      // 4. Deduct stock and create OUT movements for each item
      for (const { product, item } of productsToUpdate) {
        const newStock = product.currentStock - item.quantity;

        // Extra safeguard against negative stock
        if (newStock < 0) {
          throw new InsufficientStockError(`Negative stock prevented for product ${product.sku}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: newStock }
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            movementType: "OUT",
            reason: `Sales Challan Confirmation (${challan.challanNumber})`,
            referenceType: "SALES_CHALLAN",
            referenceId: challan.id,
            createdBy: userId,
            createdAt: new Date()
          }
        });
      }

      // 5. Update Challan state to CONFIRMED
      const confirmedAt = new Date();
      const updatedChallan = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
          confirmedBy: userId,
          confirmedAt
        },
        include: {
          customer: true,
          createdByUser: {
            select: { id: true, name: true, email: true }
          },
          confirmedByUser: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // 6. Audit Log within transaction
      await tx.auditLog.create({
        data: {
          userId,
          action: "CHALLAN_CONFIRMED",
          entity: "SalesChallan",
          entityId: challan.id,
          metadata: JSON.stringify({
            challanNumber: challan.challanNumber,
            totalAmount: challan.totalAmount,
            itemCount: challan.items.length
          })
        }
      });

      return updatedChallan as unknown as SalesChallanDto;
    }, { timeout: 10000 });
  }

  static async cancelChallan(id: string, userId: string): Promise<SalesChallanDto> {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!challan) {
        throw new NotFoundError(`Sales Challan with ID '${id}' not found`);
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new ConflictError(`Challan '${challan.challanNumber}' is already cancelled.`);
      }

      // If already CONFIRMED, reverse the deducted stock transactionally
      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: product.currentStock + item.quantity }
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantity: item.quantity,
                movementType: "IN",
                reason: `Reversal of Cancelled Challan (${challan.challanNumber})`,
                referenceType: "SALES_CHALLAN_CANCEL",
                referenceId: challan.id,
                createdBy: userId
              }
            });
          }
        }
      }

      const updated = await tx.salesChallan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED },
        include: {
          customer: true,
          createdByUser: {
            select: { id: true, name: true, email: true }
          },
          confirmedByUser: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await AuditService.logAction({
        userId,
        action: "CHALLAN_CANCELLED",
        entity: "SalesChallan",
        entityId: challan.id,
        metadata: { challanNumber: challan.challanNumber }
      });

      return updated as unknown as SalesChallanDto;
    });
  }
}
