import React from "react";
import { clsx } from "clsx";

export type BadgeVariant =
  | "confirmed"
  | "draft"
  | "cancelled"
  | "pending"
  | "active"
  | "inactive"
  | "lead"
  | "in"
  | "out"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant | string;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children, className }) => {
  const normalizedVariant = (typeof variant === "string" ? variant.toLowerCase() : "neutral") as BadgeVariant;

  const styles: Record<string, string> = {
    confirmed: "bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]",
    active: "bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]",
    in: "bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]",
    draft: "bg-zinc-100 text-zinc-700 border border-zinc-300",
    cancelled: "bg-zinc-100 text-zinc-600 border border-zinc-300 line-through-none",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    lead: "bg-blue-50 text-blue-700 border border-blue-200",
    inactive: "bg-zinc-100 text-zinc-500 border border-zinc-200",
    out: "bg-zinc-100 text-zinc-800 border border-zinc-300 font-medium",
    neutral: "bg-zinc-50 text-zinc-700 border border-zinc-200"
  };

  const selectedStyle = styles[normalizedVariant] || styles.neutral;

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide transition-colors",
        selectedStyle,
        className
      )}
    >
      {children}
    </span>
  );
};
