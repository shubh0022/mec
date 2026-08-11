import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../common/Badge";
import { SalesChallanDto } from "@vanta/shared";

interface RecentChallansTableProps {
  challans: SalesChallanDto[];
}

export const RecentChallansTable: React.FC<RecentChallansTableProps> = ({ challans }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Recent Sales Challans
        </h2>
        <Link
          to="/challans"
          className="text-xs font-semibold px-3 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 font-semibold border-b border-zinc-100">
              <th className="pb-3 pr-4">Challan No.</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4 text-center">Status</th>
              <th className="pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {challans.map((ch) => (
              <tr
                key={ch.id}
                onClick={() => navigate(`/challans/${ch.id}`)}
                className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
              >
                <td className="py-3.5 pr-4 font-mono font-bold text-[#497200]">
                  {ch.challanNumber}
                </td>
                <td className="py-3.5 pr-4 font-medium text-zinc-800 truncate max-w-[140px]">
                  {ch.customer?.customerName || "Customer"}
                </td>
                <td className="py-3.5 pr-4 text-zinc-500 whitespace-nowrap">
                  {formatDate(ch.createdAt)}
                </td>
                <td className="py-3.5 pr-4 text-center">
                  <Badge variant={ch.status}>
                    {ch.status.charAt(0) + ch.status.slice(1).toLowerCase()}
                  </Badge>
                </td>
                <td className="py-3.5 text-right font-semibold text-zinc-900 whitespace-nowrap">
                  ₹ {(ch.totalAmount || 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
