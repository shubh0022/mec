import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Search,
  ShoppingCart
} from "lucide-react";
import { customersApi } from "../api/customers";
import { productsApi } from "../api/products";
import { challansApi } from "../api/challans";
import { ProductDto, CustomerDto, CreateSalesChallanInput } from "@vanta/shared";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { useToast } from "../context/ToastContext";

interface ItemRow {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
  lineTotal: number;
}

export const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>("");

  // Review & Confirm modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isConfirmingDirectly, setIsConfirmingDirectly] = useState<boolean>(false);

  // Fetch Customers
  const { data: customersRes } = useQuery({
    queryKey: ["customersSelect"],
    queryFn: () => customersApi.getCustomers({ limit: 100 })
  });

  // Fetch Products
  const { data: productsRes } = useQuery({
    queryKey: ["productsSelect"],
    queryFn: () => productsApi.getProducts({ limit: 100 })
  });

  const customers = customersRes?.data || [];
  const products = productsRes?.data || [];

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Add Item to Challan
  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod) return;

    // Check if already added
    const existingIndex = items.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].lineTotal =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      // Add new row
      setItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.productName,
          sku: prod.sku,
          unitPrice: prod.unitPrice,
          availableStock: prod.currentStock,
          quantity: 1,
          lineTotal: prod.unitPrice
        }
      ]);
    }
    setSelectedProductToAdd("");
  };

  // Update item quantity
  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty || 1);
    const updated = [...items];
    updated[index].quantity = validQty;
    updated[index].lineTotal = validQty * updated[index].unitPrice;
    setItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  // Check if any item has quantity > availableStock
  const stockShortages = items.filter((i) => i.quantity > i.availableStock);

  // Mutations
  const createDraftMutation = useMutation({
    mutationFn: (data: CreateSalesChallanInput) => challansApi.createChallan(data),
    onSuccess: (res) => {
      success(`Challan ${res.data?.challanNumber} saved as DRAFT`);
      queryClient.invalidateQueries({ queryKey: ["challans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      navigate(`/challans/${res.data?.id}`);
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to save draft challan");
    }
  });

  const createAndConfirmMutation = useMutation({
    mutationFn: async (data: CreateSalesChallanInput) => {
      // 1. Create draft
      const draftRes = await challansApi.createChallan(data);
      if (!draftRes.data) throw new Error("Failed to create draft");
      // 2. Confirm immediately in transaction
      return challansApi.confirmChallan(draftRes.data.id);
    },
    onSuccess: (res) => {
      success(`Challan ${res.data?.challanNumber} confirmed and stock deducted!`);
      queryClient.invalidateQueries({ queryKey: ["challans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      navigate(`/challans/${res.data?.id}`);
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to confirm challan. Transaction rolled back.");
    }
  });

  const handleSaveDraft = () => {
    if (!selectedCustomerId) {
      toastError("Please select a customer before saving");
      return;
    }
    if (items.length === 0) {
      toastError("Please add at least one product item");
      return;
    }

    createDraftMutation.mutate({
      customerId: selectedCustomerId,
      notes: notes || undefined,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    });
  };

  const handleConfirmOrder = () => {
    if (!selectedCustomerId) {
      toastError("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toastError("Please add at least one product item");
      return;
    }

    if (stockShortages.length > 0) {
      toastError("Cannot confirm order: One or more products exceed available stock!");
      return;
    }

    createAndConfirmMutation.mutate({
      customerId: selectedCustomerId,
      notes: notes || undefined,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/challans")}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Create Sales Challan</h2>
            <p className="text-xs text-zinc-500">Multi-item delivery challan builder with live stock check</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Customer & Product Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Select Customer */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                1. Customer Account & Dispatch Destination
              </h3>
              {selectedCustomer && (
                <span className="text-xs font-mono font-bold text-[#497200]">
                  {selectedCustomer.customerCode}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#76B900] bg-white font-medium text-zinc-900"
              >
                <option value="">-- Choose registered customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.businessName}) • {c.customerCode}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 text-zinc-700">
                <div>
                  <span className="text-zinc-400">Mobile: </span>
                  <span className="font-semibold text-zinc-900">{selectedCustomer.mobile}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Type: </span>
                  <span className="font-semibold text-zinc-900">{selectedCustomer.customerType}</span>
                </div>
                <div>
                  <span className="text-zinc-400">GST: </span>
                  <span className="font-mono font-semibold text-zinc-900">{selectedCustomer.gstNumber || "N/A"}</span>
                </div>
                <div className="sm:col-span-3 text-[11px] text-zinc-500">
                  <span className="text-zinc-400">Address: </span>
                  {selectedCustomer.address}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Add Product Items */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              2. Add Catalog Products to Challan
            </h3>

            {/* Product Selector Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="flex-1 w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white text-zinc-900"
              >
                <option value="">-- Select product from catalog --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku}) • ₹{p.unitPrice} • Avail: {p.currentStock}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant="primary"
                onClick={handleAddProduct}
                disabled={!selectedProductToAdd}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Item
              </Button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3 text-center">Available</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center w-28">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                    <th className="py-2.5 px-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No items added yet. Select a product above and click "Add Item".
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const isShortage = item.quantity > item.availableStock;

                      return (
                        <tr
                          key={item.productId}
                          className={`hover:bg-zinc-50/50 transition-colors ${
                            isShortage ? "bg-red-50/30" : ""
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-semibold text-zinc-900">{item.productName}</div>
                            <div className="font-mono text-[10px] text-zinc-500">{item.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-bold ${
                                item.availableStock < 5 ? "text-red-500" : "text-zinc-700"
                              }`}
                            >
                              {item.availableStock}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-zinc-800">
                            ₹ {item.unitPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(idx, parseInt(e.target.value, 10))
                              }
                              className={`w-20 text-center text-xs p-1.5 rounded border focus:outline-none focus:ring-1 font-bold ${
                                isShortage
                                  ? "border-red-400 text-red-600 focus:ring-red-400"
                                  : "border-zinc-300 focus:ring-[#76B900]"
                              }`}
                            />
                            {isShortage && (
                              <div className="text-[10px] text-red-600 font-bold mt-0.5">
                                Exceeds stock ({item.availableStock})
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-zinc-900">
                            ₹ {item.lineTotal.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Dispatch / Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Delivery via logistics vehicle MH-04-1234, driver contact..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Review Summary & Actions */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              Summary & Order Value
            </h3>

            <div className="space-y-2 text-xs border-b border-zinc-100 pb-4">
              <div className="flex justify-between text-zinc-600">
                <span>Unique Line Items:</span>
                <span className="font-semibold text-zinc-900">{items.length} items</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Total Quantity Units:</span>
                <span className="font-bold text-zinc-900">{totalUnits} units</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-medium text-zinc-900">
                  ₹ {totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Taxes:</span>
                <span className="font-medium text-zinc-500">Calculated on invoice</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-zinc-900">Total Value:</span>
              <span className="text-xl font-extrabold text-[#497200]">
                ₹ {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Stock Shortage Warning */}
            {stockShortages.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong>Insufficient Inventory:</strong> {stockShortages.length} product(s) exceed available warehouse stock. Confirmation will be blocked.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full"
                disabled={items.length === 0 || !selectedCustomerId || stockShortages.length > 0}
                isLoading={createAndConfirmMutation.isPending}
                onClick={handleConfirmOrder}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Deduct Stock
              </Button>

              <Button
                variant="outline"
                className="w-full"
                disabled={items.length === 0 || !selectedCustomerId}
                isLoading={createDraftMutation.isPending}
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
