import { prisma } from "../config/prisma.js";
import { StockReportDto, SalesReportDto, ChallanStatus } from "@vanta/shared";

export class ReportService {
  /**
   * Generates Real-time Stock & Inventory Valuation Report
   */
  static async getStockReport(warehouseId?: string, categoryId?: string): Promise<StockReportDto> {
    const where: any = { isActive: true };
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) where.categoryId = categoryId;

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        warehouse: true
      },
      orderBy: { currentStock: "asc" }
    });

    let totalValuation = 0;
    let totalUnits = 0;
    let lowStockCount = 0;

    const items = products.map((p) => {
      const itemValuation = p.currentStock * p.unitPrice;
      totalValuation += itemValuation;
      totalUnits += p.currentStock;

      let status: "HEALTHY" | "LOW_STOCK" | "OUT_OF_STOCK" = "HEALTHY";
      if (p.currentStock === 0) {
        status = "OUT_OF_STOCK";
        lowStockCount++;
      } else if (p.currentStock <= p.minimumStock) {
        status = "LOW_STOCK";
        lowStockCount++;
      }

      return {
        id: p.id,
        sku: p.sku,
        productCode: p.productCode,
        productName: p.productName,
        categoryName: p.category?.name || "General",
        warehouseName: p.warehouse?.name || "Main Facility",
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        unitPrice: p.unitPrice,
        totalValuation: itemValuation,
        status
      };
    });

    return {
      summary: {
        totalValuation,
        totalUnits,
        lowStockCount,
        totalSkus: products.length
      },
      items
    };
  }

  /**
   * Generates Real-time Sales Revenue & Delivery Performance Report
   */
  static async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReportDto> {
    const where: any = { status: ChallanStatus.CONFIRMED };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const challans = await prisma.salesChallan.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let totalRevenue = 0;
    let totalUnitsDispatched = 0;

    const customerSpendMap = new Map<string, { name: string; business: string; spend: number; count: number }>();
    const productSoldMap = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();

    for (const c of challans) {
      const amt = c.totalAmount || 0;
      totalRevenue += amt;
      totalUnitsDispatched += c.totalQuantity;

      // Aggregate customer spend
      const custId = c.customerId;
      const existingCust = customerSpendMap.get(custId) || {
        name: c.customer?.customerName || "Customer",
        business: c.customer?.businessName || "Business",
        spend: 0,
        count: 0
      };
      existingCust.spend += amt;
      existingCust.count += 1;
      customerSpendMap.set(custId, existingCust);

      // Aggregate product sales
      for (const item of c.items) {
        const pId = item.productId;
        const existingProd = productSoldMap.get(pId) || {
          name: item.productNameSnapshot,
          sku: item.skuSnapshot,
          qty: 0,
          revenue: 0
        };
        existingProd.qty += item.quantity;
        existingProd.revenue += item.lineTotal;
        productSoldMap.set(pId, existingProd);
      }
    }

    const topCustomers = Array.from(customerSpendMap.entries())
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name,
        businessName: data.business,
        totalSpend: data.spend,
        orderCount: data.count
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    const topProducts = Array.from(productSoldMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        sku: data.sku,
        quantitySold: data.qty,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const monthlyLedger = challans.slice(0, 25).map((c) => ({
      challanNumber: c.challanNumber,
      customerName: c.customer?.customerName || "-",
      businessName: c.customer?.businessName || "-",
      date: c.createdAt,
      quantity: c.totalQuantity,
      totalAmount: c.totalAmount || 0,
      status: c.status
    }));

    const totalOrders = challans.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalUnitsDispatched
      },
      topCustomers,
      topProducts,
      monthlyLedger
    };
  }
}
