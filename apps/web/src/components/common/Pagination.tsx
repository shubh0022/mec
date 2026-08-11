import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@vanta/shared";

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, limit, total, totalPages } = meta;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-zinc-200 bg-white text-xs text-zinc-600">
      <div>
        Showing <span className="font-semibold text-zinc-900">{startItem}</span> to{" "}
        <span className="font-semibold text-zinc-900">{endItem}</span> of{" "}
        <span className="font-semibold text-zinc-900">{total}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2.5 py-1 text-xs font-semibold text-zinc-900">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
