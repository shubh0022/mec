import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Package,
  Layers
} from "lucide-react";
import { productsApi } from "../api/products";
import { stockApi } from "../api/stock";
import {
  ProductDto,
  CreateProductSchema,
  CreateProductInput,
  CreateStockMovementSchema,
  CreateStockMovementInput,
  MovementType,
  Role
} from "@vanta/shared";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(
    searchParams.get("lowStock") === "true"
  );
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(
    searchParams.get("action") === "new"
  );
  const [adjustingProduct, setAdjustingProduct] = useState<ProductDto | null>(null);

  // Fetch Products
  const { data: response, isLoading } = useQuery({
    queryKey: ["products", page, search, selectedCategory, lowStockOnly],
    queryFn: () =>
      productsApi.getProducts({
        page,
        limit: 15,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        lowStock: lowStockOnly || undefined
      })
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsApi.getCategories()
  });

  const { data: warehousesRes } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => productsApi.getWarehouses()
  });

  const products = response?.data || [];
  const pagination = response?.pagination;
  const categories = categoriesRes?.data || [];
  const warehouses = warehousesRes?.data || [];

  // Create Product Form
  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProductForm,
    formState: { errors: productErrors, isSubmitting: isCreatingProduct }
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      unitPrice: 0,
      currentStock: 0,
      minimumStock: 5,
      isActive: true
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.createProduct(data),
    onSuccess: (res) => {
      success(`Product '${res.data?.productName}' registered (${res.data?.sku})`);
      setIsAddModalOpen(false);
      resetProductForm();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to create product");
    }
  });

  const onProductSubmit = (data: CreateProductInput) => {
    createProductMutation.mutate(data);
  };

  // Stock Adjustment Form
  const {
    register: registerStock,
    handleSubmit: handleSubmitStock,
    reset: resetStockForm,
    formState: { errors: stockErrors, isSubmitting: isSubmittingStock }
  } = useForm<CreateStockMovementInput>({
    resolver: zodResolver(CreateStockMovementSchema),
    defaultValues: {
      movementType: MovementType.IN,
      quantity: 10,
      reason: "Manual warehouse receipt audit"
    }
  });

  const createStockMutation = useMutation({
    mutationFn: (data: CreateStockMovementInput) => stockApi.createStockMovement(data),
    onSuccess: (res) => {
      success(`Stock updated: ${res.data?.movementType} ${res.data?.quantity} units`);
      setAdjustingProduct(null);
      resetStockForm();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Stock movement failed");
    }
  });

  const onStockSubmit = (data: CreateStockMovementInput) => {
    if (!adjustingProduct) return;
    createStockMutation.mutate({
      ...data,
      productId: adjustingProduct.id
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Product & Inventory Catalog</h2>
          <p className="text-xs text-zinc-500">Live warehouse inventory, SKU catalog, and stock threshold tracking</p>
        </div>
        {hasRole(Role.ADMIN, Role.WAREHOUSE) && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Product
          </Button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by product name, SKU or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76B900]"
          />
        </div>

        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-48 text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Low Stock Toggle Button */}
        <button
          onClick={() => {
            setLowStockOnly(!lowStockOnly);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
            lowStockOnly
              ? "bg-red-50 text-red-700 border-red-300"
              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${lowStockOnly ? "text-red-600" : "text-zinc-400"}`} />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Code / SKU</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Min. Stock</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4 text-right">Inventory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-zinc-50/70 ${
                      p.isLowStock ? "bg-red-50/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-zinc-900">{p.sku}</div>
                      <div className="text-[10px] text-zinc-400">{p.productCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{p.productName}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">
                      {p.category?.name || "General"}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                      ₹ {p.unitPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-extrabold px-2 py-0.5 rounded ${
                          p.isLowStock
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "text-zinc-900"
                        }`}
                      >
                        {p.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-zinc-500">
                      {p.minimumStock}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 truncate max-w-[140px]">
                      {p.warehouse?.name || "Main Hub"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasRole(Role.ADMIN, Role.WAREHOUSE) ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAdjustingProduct(p);
                              resetStockForm({
                                productId: p.id,
                                movementType: MovementType.IN,
                                quantity: 10,
                                reason: "Warehouse restock"
                              });
                            }}
                          >
                            Stock Adjust
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50/50">
            <span className="text-xs text-zinc-500">
              Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <Modal
          isOpen={Boolean(adjustingProduct)}
          onClose={() => setAdjustingProduct(null)}
          title="Warehouse Stock Adjustment"
          subtitle={`Adjust inventory for ${adjustingProduct.productName} (${adjustingProduct.sku}) • Current Stock: ${adjustingProduct.currentStock}`}
        >
          <form onSubmit={handleSubmitStock(onStockSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Movement Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white font-semibold"
                  {...registerStock("movementType")}
                >
                  <option value={MovementType.IN}>STOCK IN (Receipt / Add)</option>
                  <option value={MovementType.OUT}>STOCK OUT (Adjustment / Remove)</option>
                </select>
              </div>

              <Input
                label="Quantity (Units)"
                type="number"
                min={1}
                required
                error={stockErrors.quantity?.message}
                {...registerStock("quantity", { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Adjustment Reason & Reference"
              placeholder="e.g. Purchase order PO-2026-99 or physical cycle count discrepancy"
              required
              error={stockErrors.reason?.message}
              {...registerStock("reason")}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjustingProduct(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingStock}>
                Execute Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Catalog Product"
        subtitle="Define SKU code, pricing, and initial stock baseline"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitProduct(onProductSubmit)} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Product Name"
              placeholder="e.g. Copper Armored Cable 4-Core"
              required
              error={productErrors.productName?.message}
              {...registerProduct("productName")}
            />
            <Input
              label="SKU (Stock Keeping Unit)"
              placeholder="e.g. CBL-4CR-PRO"
              required
              error={productErrors.sku?.message}
              {...registerProduct("sku")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Category
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white"
                {...registerProduct("categoryId")}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Primary Warehouse
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white"
                {...registerProduct("warehouseId")}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Unit Price (₹)"
              type="number"
              min={0}
              required
              error={productErrors.unitPrice?.message}
              {...registerProduct("unitPrice", { valueAsNumber: true })}
            />
            <Input
              label="Initial Stock"
              type="number"
              min={0}
              error={productErrors.currentStock?.message}
              {...registerProduct("currentStock", { valueAsNumber: true })}
            />
            <Input
              label="Minimum Alert Stock"
              type="number"
              min={0}
              error={productErrors.minimumStock?.message}
              {...registerProduct("minimumStock", { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreatingProduct}>
              Register Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
