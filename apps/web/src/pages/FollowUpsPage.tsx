import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, Phone, Search } from "lucide-react";
import { customersApi } from "../api/customers";
import { Badge } from "../components/common/Badge";
import { useNavigate } from "react-router-dom";

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["customersFollowUpsAll"],
    queryFn: () => customersApi.getCustomers({ limit: 100 })
  });

  const customers = response?.data || [];

  // Extract all follow ups with customer context
  const allFollowUps: any[] = [];
  customers.forEach((cust) => {
    if (cust.followUps) {
      cust.followUps.forEach((fu) => {
        allFollowUps.push({
          ...fu,
          customer: cust
        });
      });
    }
  });

  // Sort by follow-up date ascending (due first)
  allFollowUps.sort(
    (a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime()
  );

  const filtered = allFollowUps.filter(
    (f) =>
      f.customer?.customerName.toLowerCase().includes(search.toLowerCase()) ||
      f.customer?.businessName.toLowerCase().includes(search.toLowerCase()) ||
      f.note.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Follow-ups Ledger</h2>
          <p className="text-xs text-zinc-500">Chronological history and upcoming scheduled customer interactions</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search follow-ups by customer, business, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76B900]"
          />
        </div>
      </div>

      {/* Follow-up Cards / Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Notes & Agenda</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    Loading follow-ups...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No follow-ups recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-zinc-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#76B900]" />
                        <span>{formatDate(item.followUpDate)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{item.customer?.customerName}</div>
                      <div className="text-[10px] text-zinc-500">{item.customer?.businessName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 max-w-xs">{item.note}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.createdByUser?.name || "System"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="pending">Pending</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/customers`)}
                        className="text-xs font-semibold text-[#497200] hover:underline"
                      >
                        View Account
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
