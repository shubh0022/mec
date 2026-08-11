import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: { type: ToastType; title?: string; message: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = (message: string, title?: string) => addToast({ type: "success", title: title || "Success", message });
  const error = (message: string, title?: string) => addToast({ type: "error", title: title || "Action Failed", message, duration: 6000 });
  const warning = (message: string, title?: string) => addToast({ type: "warning", title: title || "Warning", message });
  const info = (message: string, title?: string) => addToast({ type: "info", title: title || "Information", message });

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 transform translate-y-0 ${
              t.type === "success"
                ? "bg-[#0A0A0A] border-[#76B900]/40 text-white"
                : t.type === "error"
                ? "bg-[#0A0A0A] border-red-500/40 text-white"
                : t.type === "warning"
                ? "bg-[#0A0A0A] border-amber-500/40 text-white"
                : "bg-[#0A0A0A] border-zinc-700 text-white"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-[#76B900]" />}
              {t.type === "error" && <XCircle className="w-5 h-5 text-red-400" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === "info" && <Info className="w-5 h-5 text-zinc-400" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold text-zinc-100">{t.title}</div>}
              <div className="text-zinc-300 leading-snug mt-0.5">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-zinc-400 hover:text-white p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
