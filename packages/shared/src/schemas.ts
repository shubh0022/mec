import { z } from "zod";
import { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from "./enums.js";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role),
  isActive: z.boolean().default(true)
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional()
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const CreateCustomerSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  businessName: z.string().min(2, "Business name is required"),
  gstNumber: z.string().optional().or(z.literal("")),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.WHOLESALE),
  address: z.string().min(3, "Address is required"),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal(""))
});
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

export const CreateFollowUpSchema = z.object({
  note: z.string().min(2, "Follow-up note is required"),
  followUpDate: z.string().min(1, "Follow-up date is required")
});
export type CreateFollowUpInput = z.infer<typeof CreateFollowUpSchema>;

export const CreateProductSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().optional().or(z.literal("")),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  currentStock: z.number().int().min(0, "Current stock must be >= 0").default(0),
  minimumStock: z.number().int().min(0, "Minimum stock must be >= 0").default(5),
  warehouseId: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const CreateStockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(2, "Reason is required"),
  referenceType: z.string().optional(),
  referenceId: z.string().optional()
});
export type CreateStockMovementInput = z.infer<typeof CreateStockMovementSchema>;

export const ChallanItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0")
});
export type ChallanItemInput = z.infer<typeof ChallanItemInputSchema>;

export const CreateSalesChallanSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  notes: z.string().optional(),
  items: z.array(ChallanItemInputSchema).min(1, "At least one product item is required")
});
export type CreateSalesChallanInput = z.infer<typeof CreateSalesChallanSchema>;

export const UpdateSalesChallanSchema = z.object({
  customerId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(ChallanItemInputSchema).min(1).optional()
});
export type UpdateSalesChallanInput = z.infer<typeof UpdateSalesChallanSchema>;

export const CreateInvoiceSchema = z.object({
  challanId: z.string().min(1, "Challan ID is required"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(18) // e.g. 18% GST standard
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(["ISSUED", "PAID", "CANCELLED"]),
  notes: z.string().optional()
});
export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional()
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
