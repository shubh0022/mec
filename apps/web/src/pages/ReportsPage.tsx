import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  Filter,
  Calendar,
  Building,
  ArrowUpRight
} from "lucide-react";
import { reportsApi } from "../api/reports";
import { productsApi } from "../api/products";
import { Badge } from "../components/common/Badge";
import { CardSkeleton, TableSkeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";

export const ReportsPage: React.FC<{ type?: "stock" | "sales" }> = ({ type = "stock" }) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Metadata queries
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsApi.getCategories()
  });

  const { data: warehousesRes } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => productsApi.getWarehouses()
  });

  const categories = categoriesRes?.data || [];
  const warehouses = warehousesRes?.data || [];

  // Stock Report Query
  const {
    data: stockReportRes,
    isLoading: loadingStock,
    isError: errorStock,
    refetch: refetchStock
  } = useQuery({
    queryKey: ["stockReport", selectedWarehouseId, selectedCategoryId],
    queryFn: () =>
      reportsApi.getStockReport({
        warehouseId: selectedWarehouseId || undefined,
        categoryId: selectedCategoryId || undefined
      }),
    enabled: type === "stock"
  });

  // Sales Report Query
  const {
    data: salesReportRes,
    isLoading: loadingSales,
    isError: errorSales,
    refetch: refetchSales
  } = useQuery({
    queryKey: ["salesReport", startDate, endDate],
    queryFn: () =>
      reportsApi.getSalesReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }),
    enabled: type === "sales"
  });

  const stockReport = stockReportRes?.data;
  const salesReport = salesReportRes?.data;

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            {type === "stock" ? "Inventory Asset Valuation & Stock Report" : "Sales & Revenue Performance Report"}
          </h2>
          <p className="text-xs text-zinc-500">
            {type === "stock"
              ? "Comprehensive warehouse stock level breakdown, valuation, and critical replenishment alerts"
              : "Confirmed wholesale delivery revenue, top clients, best-selling SKUs, and transaction ledgers"}
          </p>
        </div>

        {/* Filters */}
        {type === "stock" ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="text-xs p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="text-xs p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
            />
            <span className="text-zinc-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
            />
          </div>
        )}
      </div>

      {type === "stock" ? (
        /* Stock Valuation View */
        errorStock ? (
          <ErrorState onRetry={refetchStock} />
        ) : loadingStock || !stockReport ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Total Inventory Asset Valuation</div>
                <div className="text-2xl font-extrabold text-[#497200] mt-1">
                  ₹ {stockReport.summary.totalValuation.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Sum of current unit rates × stock</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Physical Stock Units</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {stockReport.summary.totalUnits.toLocaleString("en-IN")} units
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Across filtered facilities</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Critical / Low Stock Items</div>
                <div className="text-2xl font-extrabold text-red-500 mt-1">
                  {stockReport.summary.lowStockCount} items
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Below minimum threshold</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Active Catalog SKUs</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {stockReport.summary.totalSkus} SKUs
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Registered products</div>
              </div>
            </div>

            {/* Inventory Valuation Breakdown Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-100 font-bold text-xs text-zinc-900 uppercase tracking-wider">
                Detailed Inventory Asset & Valuation Ledger
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                      <th className="py-3 px-4">SKU / Code</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Warehouse</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Min. Stock</th>
                      <th className="py-3 px-4 text-right">Unit Rate</th>
                      <th className="py-3 px-4 text-right">Total Valuation</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stockReport.items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-800">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">{item.categoryName}</td>
                        <td className="py-3 px-4 text-zinc-600">{item.warehouseName}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-zinc-900">
                          <span
                            className={
                              item.status === "OUT_OF_STOCK" || item.status === "LOW_STOCK"
                                ? "text-red-500 font-black"
                                : ""
                            }
                          >
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-500 font-mono">
                          {item.minimumStock}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-600">
                          ₹ {item.unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-[#497200]">
                          ₹ {item.totalValuation.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === "HEALTHY"
                                ? "bg-[#EAF7DD] text-[#497200]"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      ) : (
        /* Sales Revenue Performance View */
        errorSales ? (
          <ErrorState onRetry={refetchSales} />
        ) : loadingSales || !salesReport ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Gross Confirmed Revenue</div>
                <div className="text-2xl font-extrabold text-[#497200] mt-1">
                  ₹ {salesReport.summary.totalRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">From confirmed delivery challans</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Total Orders Fulfilled</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {salesReport.summary.totalOrders} orders
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Confirmed challans count</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Average Order Value (AOV)</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                  ₹ {salesReport.summary.averageOrderValue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Per delivery challan</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Dispatched Goods Volume</div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {salesReport.summary.totalUnitsDispatched.toLocaleString("en-IN")} units
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Physical goods delivered</div>
              </div>
            </div>

            {/* Top Customers & Top Products Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-zinc-100 font-bold text-xs text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Top Wholesale Clients by Spend</span>
                  <span className="text-zinc-400 text-[11px]">Ranked</span>
                </div>
                <div className="divide-y divide-zinc-100 text-xs">
                  {salesReport.topCustomers.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400">No client revenue data available</div>
                  ) : (
                    salesReport.topCustomers.map((cust: any, idx: number) => (
                      <div key={cust.customerId} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-zinc-400 w-4">{idx + 1}</span>
                          <div>
                            <div className="font-semibold text-zinc-900">{cust.customerName}</div>
                            <div className="text-[10px] text-zinc-500">{cust.businessName} • {cust.orderCount} orders</div>
                          </div>
                        </div>
                        <div className="font-extrabold text-sm text-[#497200]">
                          ₹ {cust.totalSpend.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-zinc-100 font-bold text-xs text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Best-Selling Products by Revenue</span>
                  <span className="text-zinc-400 text-[11px]">Ranked</span>
                </div>
                <div className="divide-y divide-zinc-100 text-xs">
                  {salesReport.topProducts.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400">No product sales data available</div>
                  ) : (
                    salesReport.topProducts.map((prod: any, idx: number) => (
                      <div key={prod.productId} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-zinc-400 w-4">{idx + 1}</span>
                          <div>
                            <div className="font-semibold text-zinc-900">{prod.productName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{prod.sku} • {prod.quantitySold} units sold</div>
                          </div>
                        </div>
                        <div className="font-extrabold text-sm text-[#497200]">
                          ₹ {prod.revenue.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};
