import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Building,
  DollarSign
} from "lucide-react";
import { invoicesApi } from "../api/invoices";
import { challansApi } from "../api/challans";
import { InvoiceDto, ChallanStatus, Role } from "@vanta/shared";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Drawer } from "../components/common/Drawer";
import { Pagination } from "../components/common/Pagination";
import { TableSkeleton } from "../components/common/Skeleton";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedChallanId, setSelectedChallanId] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState("");

  // Fetch Invoices
  const { data: invoicesRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoices", page, search, statusFilter],
    queryFn: () =>
      invoicesApi.getInvoices({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter
      })
  });

  // Fetch Confirmed Challans for generation
  const { data: challansRes } = useQuery({
    queryKey: ["confirmedChallans"],
    queryFn: () => challansApi.getChallans({ limit: 50, status: ChallanStatus.CONFIRMED }),
    enabled: isGenerateModalOpen
  });

  const invoices = invoicesRes?.data || [];
  const pagination = invoicesRes?.pagination;
  const confirmedChallans = challansRes?.data || [];

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (data: { challanId: string; taxRate: number; notes?: string }) =>
      invoicesApi.generateInvoice(data),
    onSuccess: (res) => {
      success(`Tax invoice ${res.data?.invoiceNumber} is ready`);
      setIsGenerateModalOpen(false);
      setSelectedChallanId("");
      if (res.data) {
        setSelectedInvoice(res.data);
      }
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["confirmedChallans"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to generate invoice");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PAID" | "CANCELLED" }) =>
      invoicesApi.updateStatus(id, { status }),
    onSuccess: (res) => {
      success(`Invoice ${res.data?.invoiceNumber} marked as ${res.data?.status}`);
      if (selectedInvoice && selectedInvoice.id === res.data?.id) {
        setSelectedInvoice(res.data);
      }
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to update invoice status");
    }
  });

  const handleGenerate = () => {
    if (!selectedChallanId) {
      toastError("Please select a confirmed delivery challan");
      return;
    }
    generateMutation.mutate({
      challanId: selectedChallanId,
      taxRate,
      notes: notes || undefined
    });
  };

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "-";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tax Invoices & Billing Ledger</h2>
          <p className="text-xs text-zinc-500">Official GST-compliant tax invoices linked to confirmed delivery challans</p>
        </div>

        {hasRole(Role.ADMIN, Role.ACCOUNTS) && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsGenerateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Generate Tax Invoice
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-lg border border-zinc-200 text-xs w-full sm:w-auto">
          {["ALL", "ISSUED", "PAID", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                statusFilter === status
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice, customer, challan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Invoice No.</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Challan Ref</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Tax (GST)</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Due Date</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <TableSkeleton rows={5} cols={8} />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      title="No tax invoices found"
                      description="No invoices match the current filter. Generate an invoice from a confirmed delivery challan."
                      actionLabel={hasRole(Role.ADMIN, Role.ACCOUNTS) ? "Generate Tax Invoice" : undefined}
                      onAction={hasRole(Role.ADMIN, Role.ACCOUNTS) ? () => setIsGenerateModalOpen(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                invoices.map((inv: InvoiceDto) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#497200]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{inv.customer?.customerName}</div>
                      <div className="text-[10px] text-zinc-500">{inv.customer?.businessName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {inv.challan?.challanNumber || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={inv.status.toLowerCase()}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono">
                      ₹ {inv.taxAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-zinc-900">
                      ₹ {inv.grandTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        title="View Invoice Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <Drawer
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued on ${formatDate(selectedInvoice.issuedAt)}`}
          width="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-medium">Status:</span>
                <Badge variant={selectedInvoice.status.toLowerCase()}>{selectedInvoice.status}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print
                </Button>

                {selectedInvoice.status === "ISSUED" && hasRole(Role.ADMIN, Role.ACCOUNTS) && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: selectedInvoice.id, status: "PAID" })
                    }
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    isLoading={updateStatusMutation.isPending}
                  >
                    Mark Paid
                  </Button>
                )}

                {selectedInvoice.status !== "CANCELLED" && hasRole(Role.ADMIN, Role.ACCOUNTS) && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: selectedInvoice.id, status: "CANCELLED" })
                    }
                    isLoading={updateStatusMutation.isPending}
                  >
                    Cancel Invoice
                  </Button>
                )}
              </div>
            </div>

            {/* Customer & Billing Info */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200">
              <div>
                <div className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider mb-1">
                  Billed To
                </div>
                <div className="font-bold text-sm text-zinc-900">{selectedInvoice.customer?.customerName}</div>
                <div className="text-zinc-700 font-medium">{selectedInvoice.customer?.businessName}</div>
                <div className="text-zinc-500 mt-1">{selectedInvoice.customer?.address}</div>
                {selectedInvoice.customer?.gstNumber && (
                  <div className="font-mono text-zinc-700 mt-1 font-semibold">
                    GSTIN: {selectedInvoice.customer.gstNumber}
                  </div>
                )}
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider mb-1">
                  Reference & Dates
                </div>
                <div className="text-zinc-600">
                  Challan Ref:{" "}
                  <span className="font-mono font-bold text-[#497200]">
                    {selectedInvoice.challan?.challanNumber}
                  </span>
                </div>
                <div className="text-zinc-600">
                  Issue Date: <span className="font-medium text-zinc-900">{formatDate(selectedInvoice.issuedAt)}</span>
                </div>
                <div className="text-zinc-600">
                  Payment Due: <span className="font-medium text-zinc-900">{formatDate(selectedInvoice.dueDate)}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            {selectedInvoice.challan?.items && (
              <div>
                <div className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-2">
                  Invoiced Line Items
                </div>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                        <th className="py-2.5 px-3">Item / SKU</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedInvoice.challan.items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-zinc-900">{i.productNameSnapshot}</div>
                            <div className="font-mono text-[10px] text-zinc-400">{i.skuSnapshot}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-600">
                            ₹ {i.unitPriceSnapshot.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-900">{i.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-zinc-900">
                            ₹ {i.lineTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 border-t border-zinc-200 pt-3">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-zinc-900">
                    ₹ {selectedInvoice.subTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>GST Taxes (18%):</span>
                  <span className="font-medium text-zinc-900">
                    ₹ {selectedInvoice.taxAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-900 border-t border-zinc-200 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#497200]">
                    ₹ {selectedInvoice.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Generate Invoice Modal */}
      {isGenerateModalOpen && (
        <Modal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Generate Official Tax Invoice"
          subtitle="Select a confirmed delivery challan to issue a GST tax invoice"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Select Confirmed Delivery Challan <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedChallanId}
                onChange={(e) => setSelectedChallanId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white font-medium text-zinc-900"
              >
                <option value="">-- Choose confirmed challan --</option>
                {confirmedChallans.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.challanNumber} • {ch.customer?.customerName} • ₹ {(ch.totalAmount || 0).toLocaleString("en-IN")}{ch.invoice ? ` [Already Invoiced: ${ch.invoice.invoiceNumber}]` : ""}
                  </option>
                ))}
              </select>

              {(() => {
                const selectedChallan = confirmedChallans.find((c) => c.id === selectedChallanId);
                if (selectedChallan?.invoice) {
                  return (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <span>
                        Tax invoice <strong>{selectedChallan.invoice.invoiceNumber}</strong> is already issued for this challan.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGenerateModalOpen(false);
                          const matched = invoices.find((inv) => inv.id === selectedChallan.invoice?.id || inv.invoiceNumber === selectedChallan.invoice?.invoiceNumber);
                          if (matched) {
                            setSelectedInvoice(matched);
                          } else if (selectedChallan.invoice?.id) {
                            invoicesApi.getInvoiceById(selectedChallan.invoice.id).then((res) => {
                              if (res.data) setSelectedInvoice(res.data);
                            });
                          }
                        }}
                        className="underline font-bold text-amber-950 hover:text-black ml-2 whitespace-nowrap cursor-pointer"
                      >
                        View Invoice
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                GST Tax Rate (%)
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white font-medium text-zinc-900"
              >
                <option value={18}>18% GST (Standard)</option>
                <option value={12}>12% GST (Reduced)</option>
                <option value={5}>5% GST (Essential)</option>
                <option value={0}>0% (Exempt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Billing Notes / Terms (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Net 30 days payment terms via RTGS/NEFT transfer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={generateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={generateMutation.isPending}
                onClick={handleGenerate}
                disabled={!selectedChallanId}
              >
                Issue Tax Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
