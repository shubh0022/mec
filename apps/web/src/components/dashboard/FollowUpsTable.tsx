import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../common/Badge";

interface FollowUpItem {
  id: string;
  customerId: string;
  customerName: string;
  businessName: string;
  followUpDate: string;
  assignedToName: string;
  status: string;
  note: string;
}

interface FollowUpsTableProps {
  followUps: FollowUpItem[];
}

export const FollowUpsTable: React.FC<FollowUpsTableProps> = ({ followUps }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
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
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">Follow-ups Due</h2>
        <Link
          to="/follow-ups"
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
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Follow-up Date</th>
              <th className="pb-3 pr-4">Assigned To</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {followUps.map((f) => (
              <tr
                key={f.id}
                onClick={() => navigate(`/customers/${f.customerId}`)}
                className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
              >
                <td className="py-3.5 pr-4 font-medium text-zinc-800 truncate max-w-[150px]">
                  {f.customerName}
                </td>
                <td className="py-3.5 pr-4 text-zinc-500 whitespace-nowrap">
                  {formatDate(f.followUpDate)}
                </td>
                <td className="py-3.5 pr-4 font-medium text-zinc-700">
                  {f.assignedToName}
                </td>
                <td className="py-3.5 text-right">
                  <Badge variant="pending">Pending</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
