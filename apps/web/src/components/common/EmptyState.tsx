import React from "react";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
        {icon || <FolderOpen className="w-6 h-6 text-zinc-400" />}
      </div>
      <h3 className="text-sm font-bold text-zinc-900 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} leftIcon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
