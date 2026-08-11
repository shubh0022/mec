import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message = "An error occurred while communicating with the operations server.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry Request
        </Button>
      )}
    </div>
  );
};
