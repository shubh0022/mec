import { prisma } from "../config/prisma.js";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateFollowUpInput,
  CustomerDto,
  CustomerFollowUpDto,
  CustomerType,
  CustomerStatus
} from "@vanta/shared";
import { NotFoundError } from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class CustomerService {
  private static async generateCustomerCode(): Promise<string> {
    const customers = await prisma.customer.findMany({
      select: { customerCode: true }
    });

    let maxNum = 1000;
    for (const c of customers) {
      if (c.customerCode && c.customerCode.startsWith("CUST-")) {
        const num = parseInt(c.customerCode.replace("CUST-", ""), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    return `CUST-${maxNum + 1}`;
  }

  static async getCustomers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    customerType?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerCode: { contains: search } },
        { businessName: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true }
          },
          followUps: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              createdByUser: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      })
    ]);

    return {
      data: customers as unknown as CustomerDto[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomerById(id: string): Promise<CustomerDto> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true }
        },
        followUps: {
          orderBy: { createdAt: "desc" },
          include: {
            createdByUser: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        challans: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            items: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    return customer as unknown as CustomerDto;
  }

  static async createCustomer(input: CreateCustomerInput, userId: string): Promise<CustomerDto> {
    const customerCode = await this.generateCustomerCode();

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        customerName: input.customerName.trim(),
        mobile: input.mobile.trim(),
        email: input.email ? input.email.trim() : null,
        businessName: input.businessName.trim(),
        gstNumber: input.gstNumber ? input.gstNumber.trim().toUpperCase() : null,
        customerType: input.customerType || CustomerType.WHOLESALE,
        address: input.address.trim(),
        status: input.status || CustomerStatus.ACTIVE,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        notes: input.notes ? input.notes.trim() : null,
        createdBy: userId
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // If initial follow-up note or date is provided, create initial follow-up record
    if (input.followUpDate || input.notes) {
      await prisma.customerFollowUp.create({
        data: {
          customerId: customer.id,
          note: input.notes || "Initial customer creation follow-up",
          followUpDate: input.followUpDate ? new Date(input.followUpDate) : new Date(),
          createdBy: userId
        }
      });
    }

    AuditService.logAction({
      userId,
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: customer.id,
      metadata: { code: customer.customerCode, name: customer.customerName }
    }).catch(console.error);

    return customer as unknown as CustomerDto;
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput, userId: string): Promise<CustomerDto> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    const updateData: any = {};
    if (input.customerName) updateData.customerName = input.customerName.trim();
    if (input.mobile) updateData.mobile = input.mobile.trim();
    if (input.email !== undefined) updateData.email = input.email ? input.email.trim() : null;
    if (input.businessName) updateData.businessName = input.businessName.trim();
    if (input.gstNumber !== undefined) updateData.gstNumber = input.gstNumber ? input.gstNumber.trim().toUpperCase() : null;
    if (input.customerType) updateData.customerType = input.customerType;
    if (input.address) updateData.address = input.address.trim();
    if (input.status) updateData.status = input.status;
    if (input.followUpDate !== undefined) updateData.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
    if (input.notes !== undefined) updateData.notes = input.notes ? input.notes.trim() : null;

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    AuditService.logAction({
      userId,
      action: "CUSTOMER_UPDATED",
      entity: "Customer",
      entityId: updated.id,
      metadata: { fields: Object.keys(updateData) }
    }).catch(console.error);

    return updated as unknown as CustomerDto;
  }

  static async deleteCustomer(id: string, userId: string) {
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { challans: { take: 1 } }
    });

    if (!existing) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }

    // Soft-deactivate if customer has historic challans
    if (existing.challans.length > 0) {
      await prisma.customer.update({
        where: { id },
        data: { status: "INACTIVE" }
      });
    } else {
      await prisma.customer.delete({ where: { id } });
    }

    AuditService.logAction({
      userId,
      action: "CUSTOMER_DELETED",
      entity: "Customer",
      entityId: id,
      metadata: { customerName: existing.customerName }
    }).catch(console.error);

    return { message: "Customer successfully deleted/deactivated" };
  }

  static async getFollowUps(customerId: string): Promise<CustomerFollowUpDto[]> {
    const followUps = await prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return followUps as unknown as CustomerFollowUpDto[];
  }

  static async createFollowUp(
    customerId: string,
    input: CreateFollowUpInput,
    userId: string
  ): Promise<CustomerFollowUpDto> {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    const followUpDate = new Date(input.followUpDate);

    // Create follow up record in ledger
    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId,
        note: input.note.trim(),
        followUpDate,
        createdBy: userId
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update customer's next followUpDate
    await prisma.customer.update({
      where: { id: customerId },
      data: { followUpDate }
    });

    AuditService.logAction({
      userId,
      action: "FOLLOW_UP_CREATED",
      entity: "CustomerFollowUp",
      entityId: followUp.id,
      metadata: { customerId, followUpDate }
    }).catch(console.error);

    return followUp as unknown as CustomerFollowUpDto;
  }
}
