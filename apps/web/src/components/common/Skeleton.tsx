import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-zinc-200/80 rounded-md ${className}`} />;
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-zinc-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-4 ${cIdx === 0 ? "w-28" : cIdx === 1 ? "w-40" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-xs space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
};
