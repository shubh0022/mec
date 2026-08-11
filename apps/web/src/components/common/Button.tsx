import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-[#76B900] text-black font-semibold hover:bg-[#66A000] focus:ring-[#76B900] shadow-sm",
    secondary:
      "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900 border border-zinc-800",
    outline:
      "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus:ring-zinc-400 shadow-sm",
    ghost:
      "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-400",
    danger:
      "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500 shadow-sm"
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5"
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
