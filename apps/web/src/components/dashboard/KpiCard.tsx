import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  viewAllLink?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  viewAllLink
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs flex items-center gap-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
      {/* Circular green icon container matching reference design */}
      <div className="w-14 h-14 rounded-full bg-[#EAF7DD] flex items-center justify-center shrink-0 border border-[#D4EFBA]">
        <Icon className="w-7 h-7 text-[#497200]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-zinc-500 mb-1 truncate">{title}</div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          {value}
        </div>
        {trend ? (
          <div className="text-xs font-medium text-[#497200] mt-1 flex items-center gap-1">
            <span>{trend}</span>
          </div>
        ) : viewAllLink ? (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-[#497200] hover:underline mt-1 inline-block"
          >
            View all
          </Link>
        ) : null}
      </div>
    </div>
  );
};
