import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";
import { stockApi } from "../api/stock";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { MovementType } from "@vanta/shared";

export const StockMovementsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ["stockMovements", page, search, selectedType],
    queryFn: () =>
      stockApi.getStockMovements({
        page,
        limit: 20,
        search: search || undefined,
        movementType: selectedType || undefined
      })
  });

  const movements = response?.data || [];
  const pagination = response?.pagination;

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Stock Movement Audit Ledger</h2>
          <p className="text-xs text-zinc-500">Immutable ledger recording all inventory receipts, sales deductions, and adjustments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by product name, SKU, reason or reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76B900]"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
          {["", MovementType.IN, MovementType.OUT].map((tp) => (
            <button
              key={tp}
              onClick={() => {
                setSelectedType(tp);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedType === tp
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tp ? (tp === "IN" ? "Stock IN" : "Stock OUT") : "All Movements"}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4 text-center">Movement</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4">Reason & Reference</th>
                <th className="py-3.5 px-4 text-right">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    Loading stock ledger...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No stock movements found.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap font-mono">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {m.product?.productName || "Product"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      {m.product?.sku || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          m.movementType === "IN"
                            ? "bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]"
                            : "bg-zinc-100 text-zinc-800 border border-zinc-300"
                        }`}
                      >
                        {m.movementType === "IN" ? (
                          <ArrowDownRight className="w-3 h-3 text-[#497200]" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                        )}
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900">
                      {m.movementType === "IN" ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 max-w-sm">
                      <div>{m.reason}</div>
                      {m.referenceId && (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Ref: {m.referenceType} ({m.referenceId.slice(0, 10)}...)
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-600 whitespace-nowrap">
                      {m.createdByUser?.name || "System"}
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
    </div>
  );
};
