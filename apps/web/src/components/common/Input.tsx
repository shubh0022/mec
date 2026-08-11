import React, { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-700 mb-1.5">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "block w-full rounded-lg text-sm transition-colors border bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900]",
              leftIcon ? "pl-9" : "pl-3.5",
              "pr-3.5 py-2",
              error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-zinc-300",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
