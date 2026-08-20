import React from "react";
import {
  Menu,
  Bell,
  Search,
  Shield,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "@vanta/shared";

interface TopbarProps {
  title: string;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  onOpenCommandPalette,
  onOpenMobileMenu
}) => {
  const { user, isGuest } = useAuth();

  const getRoleBadgeStyle = (role?: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case Role.SALES:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case Role.WAREHOUSE:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case Role.ACCOUNTS:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case Role.GUEST:
        return "bg-[#EAF7DD] text-[#3D6000] border-[#76B900]/40";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">{title}</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-500 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 bg-white rounded border border-zinc-300 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* User Role Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeStyle(
            user?.role
          )}`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Role:</span>
          <span className="font-bold">{user?.role || "GUEST"}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => onOpenCommandPalette()}
            className="relative p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#76B900] text-black text-[10px] font-bold flex items-center justify-center shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Right User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-zinc-300 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs border border-zinc-800">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-zinc-900 leading-tight">
              {user?.name || (isGuest ? "Guest Demo" : "Employee")}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
              {user?.email || "guest@vanta.local"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
