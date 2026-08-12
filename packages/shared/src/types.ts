import { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from "./enums.js";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: string[] | Record<string, any>[];
  pagination?: PaginationMeta;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
}

export interface CustomerFollowUpDto {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string | Date;
  createdBy: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
}

export interface CustomerDto {
  id: string;
  customerCode: string;
  customerName: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | Date | null;
  notes?: string | null;
  createdBy: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  followUps?: CustomerFollowUpDto[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface WarehouseDto {
  id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CategoryDto {
  id: string;
  name: string;
  code: string;
  createdAt: string | Date;
}

export interface ProductDto {
  id: string;
  productCode: string;
  productName: string;
  sku: string;
  categoryId?: string | null;
  category?: CategoryDto | null;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseId?: string | null;
  warehouse?: WarehouseDto | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  isLowStock?: boolean;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  product?: {
    id: string;
    productName: string;
    sku: string;
    productCode: string;
  };
  quantity: number;
  movementType: MovementType;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdBy: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
}

export interface SalesChallanItemDto {
  id: string;
  challanId: string;
  productId: string;
  product?: ProductDto | null;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesChallanDto {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: CustomerDto | null;
  status: ChallanStatus;
  totalQuantity: number;
  subTotal?: number;
  totalAmount?: number;
  notes?: string | null;
  items: SalesChallanItemDto[];
  createdBy: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  confirmedBy?: string | null;
  confirmedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  confirmedAt?: string | Date | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    grandTotal?: number;
    issuedAt?: string | Date;
  } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DashboardSummaryDto {
  kpis: {
    totalCustomers: number;
    customersTrend: string;
    totalProducts: number;
    productsTrend: string;
    lowStockItemsCount: number;
    salesThisMonth: number;
    salesMonthTrend: string;
    totalInventoryUnits: number;
    activeCustomersCount: number;
    pendingDraftChallansCount: number;
    confirmedChallansCount: number;
  };
  salesOverview: {
    date: string;
    displayDate: string;
    amount: number;
  }[];
  recentChallans: SalesChallanDto[];
  lowStockAlerts: ProductDto[];
  followUpsDue: {
    id: string;
    customerId: string;
    customerName: string;
    businessName: string;
    followUpDate: string;
    assignedToName: string;
    status: string;
    note: string;
  }[];
}

export interface AuditLogDto {
  id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    role: Role;
  };
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  createdAt: string | Date;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  challanId: string;
  challan?: SalesChallanDto | null;
  customerId: string;
  customer?: CustomerDto | null;
  status: string; // ISSUED, PAID, CANCELLED
  subTotal: number;
  taxAmount: number;
  grandTotal: number;
  dueDate?: string | Date | null;
  issuedAt: string | Date;
  paidAt?: string | Date | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface StockReportDto {
  summary: {
    totalValuation: number;
    totalUnits: number;
    lowStockCount: number;
    totalSkus: number;
  };
  items: {
    id: string;
    sku: string;
    productCode: string;
    productName: string;
    categoryName: string;
    warehouseName: string;
    currentStock: number;
    minimumStock: number;
    unitPrice: number;
    totalValuation: number;
    status: "HEALTHY" | "LOW_STOCK" | "OUT_OF_STOCK";
  }[];
}

export interface SalesReportDto {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalUnitsDispatched: number;
  };
  topCustomers: {
    customerId: string;
    customerName: string;
    businessName: string;
    totalSpend: number;
    orderCount: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
  }[];
  monthlyLedger: {
    challanNumber: string;
    customerName: string;
    businessName: string;
    date: string | Date;
    quantity: number;
    totalAmount: number;
    status: string;
  }[];
}
