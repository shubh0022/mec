import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FileText, CheckCircle2, Eye } from "lucide-react";
import { challansApi } from "../api/challans";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ChallanStatus, Role } from "@vanta/shared";

export const SalesChallansPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [confirmingChallan, setConfirmingChallan] = useState<any | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["challans", page, search, selectedStatus],
    queryFn: () =>
      challansApi.getChallans({
        page,
        limit: 15,
        search: search || undefined,
        status: selectedStatus || undefined
      })
  });

  const challans = response?.data || [];
  const pagination = response?.pagination;

  const confirmMutation = useMutation({
    mutationFn: (id: string) => challansApi.confirmChallan(id),
    onSuccess: (res) => {
      success(`Challan ${res.data?.challanNumber} confirmed and stock deducted immediately!`);
      setConfirmingChallan(null);
      queryClient.invalidateQueries({ queryKey: ["challans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to confirm challan");
    }
  });

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Sales Challans & Dispatch</h2>
          <p className="text-xs text-zinc-500">Multi-item order delivery vouchers with real-time stock deduction</p>
        </div>
        {hasRole(Role.ADMIN, Role.SALES) && (
          <Button
            size="sm"
            onClick={() => navigate("/challans/new")}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Sales Challan
          </Button>
        )}
      </div>

      {/* Search and Tabs */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by challan number, customer name, business..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76B900]"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
          {["", ChallanStatus.DRAFT, ChallanStatus.CONFIRMED, ChallanStatus.CANCELLED].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {st || "All Challans"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Challan No.</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-center">Total Qty</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#497200]">
                      {ch.challanNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{ch.customer?.customerName}</div>
                      <div className="text-[10px] text-zinc-400">{ch.customer?.businessName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDate(ch.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-zinc-600">
                      {ch.items?.length || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-zinc-900">
                      {ch.totalQuantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900">
                      ₹ {(ch.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={ch.status}>
                        {ch.status.charAt(0) + ch.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/challans/${ch.id}`)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                        {ch.status === ChallanStatus.DRAFT && hasRole(Role.ADMIN, Role.SALES) && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setConfirmingChallan(ch)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
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

      {/* Confirmation Modal with Transaction Feedback */}
      {confirmingChallan && (
        <Modal
          isOpen={Boolean(confirmingChallan)}
          onClose={() => setConfirmingChallan(null)}
          title={`Confirm Challan ${confirmingChallan.challanNumber}?`}
          subtitle="Inventory will be checked and stock will be deducted immediately in an atomic transaction."
        >
          <div className="space-y-4 text-xs">
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-semibold text-zinc-900">{confirmingChallan.customer?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Items:</span>
                <span className="font-semibold text-zinc-900">{confirmingChallan.items?.length || 0} line items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Units:</span>
                <span className="font-semibold text-zinc-900">{confirmingChallan.totalQuantity} units</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-bold">
                <span className="text-zinc-700">Total Value:</span>
                <span className="text-[#497200]">₹ {(confirmingChallan.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-relaxed">
              ⚠️ <strong>Stock Integrity Guarantee:</strong> If any product in this order has insufficient stock, the transaction will automatically abort and no inventory will be deducted.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingChallan(null)}
                disabled={confirmMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate(confirmingChallan.id)}
              >
                Confirm & Deduct Stock
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
