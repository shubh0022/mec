import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  User,
  ShieldCheck,
  Package
} from "lucide-react";
import { challansApi } from "../api/challans";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ChallanStatus, Role } from "@vanta/shared";

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["challan", id],
    queryFn: () => challansApi.getChallanById(id!),
    enabled: Boolean(id)
  });

  const challan = response?.data;

  // Confirm Mutation
  const confirmMutation = useMutation({
    mutationFn: () => challansApi.confirmChallan(id!),
    onSuccess: (res) => {
      success(`Challan ${res.data?.challanNumber} confirmed and stock deducted successfully!`);
      setIsConfirmModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["challan", id] });
      queryClient.invalidateQueries({ queryKey: ["challans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to confirm challan");
    }
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: () => challansApi.cancelChallan(id!),
    onSuccess: (res) => {
      success(`Challan ${res.data?.challanNumber} has been cancelled`);
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["challan", id] });
      queryClient.invalidateQueries({ queryKey: ["challans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to cancel challan");
    }
  });

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (isLoading || !challan) {
    return (
      <div className="p-8 text-center text-zinc-400 animate-pulse">
        Loading sales challan voucher...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (Hidden during printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/challans")}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight">
                {challan.challanNumber}
              </h2>
              <Badge variant={challan.status}>{challan.status}</Badge>
            </div>
            <p className="text-xs text-zinc-500">Official Delivery Voucher & Goods Dispatch Record</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Voucher
          </Button>

          {challan.status === ChallanStatus.DRAFT && hasRole(Role.ADMIN, Role.SALES) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsConfirmModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Deduct Stock
            </Button>
          )}

          {challan.status !== ChallanStatus.CANCELLED && hasRole(Role.ADMIN, Role.SALES) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel Voucher
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice / Delivery Voucher Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-zinc-200 shadow-xs space-y-6 print:shadow-none print:border-0 print:p-0">
        {/* Voucher Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-extrabold text-zinc-900">VANTA ERP</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]">
                OFFICIAL CHALLAN
              </span>
            </div>
            <p className="text-xs text-zinc-500">Operations Intelligence & Logistics Center</p>
            <p className="text-xs text-zinc-500">Building 4, Industrial Logistics Zone, Navi Mumbai</p>
            <p className="text-xs text-zinc-500">GSTIN: 27AABCV1024K1Z5 • support@vantaerp.internal</p>
          </div>

          <div className="sm:text-right space-y-1 text-xs">
            <div className="font-mono text-base font-extrabold text-zinc-900">
              {challan.challanNumber}
            </div>
            <div className="text-zinc-500">
              Generated: <span className="font-semibold text-zinc-800">{formatDate(challan.createdAt)}</span>
            </div>
            {challan.confirmedAt && (
              <div className="text-zinc-500">
                Confirmed: <span className="font-semibold text-[#497200]">{formatDate(challan.confirmedAt)}</span>
              </div>
            )}
            <div className="pt-1">
              <Badge variant={challan.status}>{challan.status}</Badge>
            </div>
          </div>
        </div>

        {/* Customer & Logistics Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
              Consignee / Customer Details
            </div>
            <div className="font-bold text-sm text-zinc-900">{challan.customer?.customerName}</div>
            <div className="text-zinc-700 font-medium">{challan.customer?.businessName}</div>
            <div className="text-zinc-600">{challan.customer?.address}</div>
            <div className="text-zinc-600">Contact: {challan.customer?.mobile}</div>
            {challan.customer?.gstNumber && (
              <div className="font-mono text-zinc-800">GST: {challan.customer?.gstNumber}</div>
            )}
          </div>

          <div className="space-y-1 sm:text-right">
            <div className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
              Dispatch Details & Personnel
            </div>
            <div className="text-zinc-700">
              Prepared By: <span className="font-semibold text-zinc-900">{challan.createdByUser?.name || "Operations Team"}</span>
            </div>
            {challan.confirmedByUser && (
              <div className="text-zinc-700">
                Authorized Confirmer: <span className="font-semibold text-[#497200]">{challan.confirmedByUser.name}</span>
              </div>
            )}
            <div className="text-zinc-600">
              Customer Code: <span className="font-mono font-semibold">{challan.customer?.customerCode}</span>
            </div>
            {challan.notes && (
              <div className="text-[11px] text-zinc-600 italic mt-2 bg-white p-2 rounded border border-zinc-200 text-left sm:text-right">
                Notes: {challan.notes}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table with Historical Snapshots */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider text-[11px]">
            Dispatched Items & Historical Pricing Snapshot
          </h3>

          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Description (Snapshot)</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (Snapshot)</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {challan.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-3 text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">
                      {item.productNameSnapshot}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-500">
                      {item.skuSnapshot}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-700">
                      ₹ {item.unitPriceSnapshot.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-zinc-900">
                      ₹ {item.lineTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-zinc-200">
          <div className="text-xs text-zinc-500 max-w-sm">
            <p>
              * <strong>Integrity Note:</strong> All product names, SKUs, and unit rates are preserved via immutable snapshots at the time of creation.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Total Dispatched Quantity:</span>
              <span className="font-bold text-zinc-900">{challan.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-zinc-900">
                ₹ {(challan.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 border-t border-zinc-200 pt-2">
              <span>Total Amount:</span>
              <span className="text-[#497200]">
                ₹ {(challan.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Confirm Challan ${challan.challanNumber}?`}
          subtitle="Stock will be deducted immediately from warehouse inventory in an atomic transaction."
        >
          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Confirming this sales challan will automatically deduct <strong>{challan.totalQuantity} units</strong> across {challan.items.length} products and create immutable OUT stock movement ledger entries.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={confirmMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
              >
                Confirm Challan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title={`Cancel Challan ${challan.challanNumber}?`}
          subtitle={
            challan.status === ChallanStatus.CONFIRMED
              ? "Warning: Cancelling a confirmed challan will reverse and restore deducted warehouse stock."
              : "Mark this draft challan as cancelled."
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Are you sure you want to cancel this delivery voucher?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelMutation.isPending}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Yes, Cancel Voucher
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
