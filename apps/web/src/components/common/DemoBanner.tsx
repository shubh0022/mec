import React from "react";
import { Sparkles, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const DemoBanner: React.FC = () => {
  const { isGuest, logout } = useAuth();

  if (!isGuest) return null;

  return (
    <div className="bg-[#0E131F] border-b border-[#76B900]/30 px-4 py-2 text-xs text-zinc-300 flex items-center justify-between shadow-xs sticky top-0 z-40">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40 shrink-0 uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          DEMO MODE
        </span>
        <span className="truncate text-[11px] text-zinc-300">
          Read-only demonstration environment • Production mutations and administrative settings are disabled
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors"
          title="Exit guest demo session"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit Demo</span>
        </button>
      </div>
    </div>
  );
};
