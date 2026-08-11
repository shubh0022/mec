import { prisma } from "../config/prisma.js";
import { CreateInvoiceInput, UpdateInvoiceStatusInput, InvoiceDto, ChallanStatus, InvoiceStatus } from "@vanta/shared";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class InvoiceService {
  private static async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const yearShort = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `INV-${yearShort}${month}-`;

    const lastInvoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true }
    });

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    const currentSeq = parseInt(lastInvoice.invoiceNumber.replace(prefix, ""), 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(3, "0")}`;
  }

  static async getInvoices(
    page: number = 1,
    limit: number = 20,
    status?: string,
    customerId?: string,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { customer: { businessName: { contains: search } } },
        { challan: { challanNumber: { contains: search } } }
      ];
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          challan: {
            include: {
              items: {
                include: { product: true }
              }
            }
          }
        }
      })
    ]);

    return {
      data: invoices as unknown as InvoiceDto[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getInvoiceById(id: string): Promise<InvoiceDto> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        challan: {
          include: {
            items: {
              include: { product: true }
            },
            createdByUser: { select: { id: true, name: true, email: true } },
            confirmedByUser: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID '${id}' not found`);
    }

    return invoice as unknown as InvoiceDto;
  }

  static async generateFromChallan(input: CreateInvoiceInput, userId: string): Promise<InvoiceDto> {
    // 1. Fetch Challan
    const challan = await prisma.salesChallan.findUnique({
      where: { id: input.challanId },
      include: {
        items: true,
        customer: true,
        invoice: true
      }
    });

    if (!challan) {
      throw new NotFoundError(`Sales Challan with ID '${input.challanId}' not found`);
    }

    if (challan.status !== ChallanStatus.CONFIRMED) {
      throw new ConflictError(
        `Cannot issue invoice for challan in '${challan.status}' status. Only CONFIRMED challans can be invoiced.`
      );
    }

    if (challan.invoice) {
      throw new ConflictError(
        `Invoice '${challan.invoice.invoiceNumber}' has already been generated for this challan.`
      );
    }

    const subTotal = challan.totalAmount || 0;
    const taxRate = input.taxRate !== undefined ? input.taxRate : 18;
    const taxAmount = Math.round((subTotal * taxRate) / 100);
    const grandTotal = subTotal + taxAmount;
    const invoiceNumber = await this.generateInvoiceNumber();

    const dueDate = input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days standard

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        challanId: challan.id,
        customerId: challan.customerId,
        status: InvoiceStatus.ISSUED,
        subTotal,
        taxAmount,
        grandTotal,
        dueDate,
        notes: input.notes?.trim() || null
      },
      include: {
        customer: true,
        challan: {
          include: {
            items: true
          }
        }
      }
    });

    await AuditService.logAction({
      userId,
      action: "INVOICE_GENERATED",
      entity: "Invoice",
      entityId: invoice.id,
      metadata: { invoiceNumber: invoice.invoiceNumber, grandTotal, challanNumber: challan.challanNumber }
    });

    return invoice as unknown as InvoiceDto;
  }

  static async updateStatus(id: string, input: UpdateInvoiceStatusInput, userId: string): Promise<InvoiceDto> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Invoice with ID '${id}' not found`);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.status === InvoiceStatus.PAID ? { paidAt: new Date() } : {}),
        ...(input.notes ? { notes: input.notes.trim() } : {})
      },
      include: {
        customer: true,
        challan: {
          include: { items: true }
        }
      }
    });

    await AuditService.logAction({
      userId,
      action: "INVOICE_UPDATED",
      entity: "Invoice",
      entityId: updated.id,
      metadata: { invoiceNumber: updated.invoiceNumber, newStatus: updated.status }
    });

    return updated as unknown as InvoiceDto;
  }
}
