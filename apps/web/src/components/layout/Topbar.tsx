import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Shield,
  ChevronDown,
  User as UserIcon,
  Check
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
  const { user, switchDemoRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const demoRoles = [
    { role: Role.ADMIN, name: "Admin (John Doe)", label: "Admin" },
    { role: Role.SALES, name: "Sales (Jane Smith)", label: "Sales" },
    { role: Role.WAREHOUSE, name: "Warehouse (Mike Johnson)", label: "Warehouse" },
    { role: Role.ACCOUNTS, name: "Accounts (Sarah Connor)", label: "Accounts" }
  ];

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h1>
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

        {/* Demo Role Switcher Dropdown / Pills */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors"
            title="Switch demo persona to test RBAC"
          >
            <Shield className="w-3.5 h-3.5 text-[#76B900]" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold text-zinc-900">{user?.role || "ADMIN"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 font-bold text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-100 mb-1">
                  Demo RBAC Personas
                </div>
                {demoRoles.map((item) => (
                  <button
                    key={item.role}
                    onClick={async () => {
                      await switchDemoRole(item.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-50 transition-colors ${
                      user?.role === item.role
                        ? "text-[#497200] font-bold bg-[#EAF7DD]/50"
                        : "text-zinc-700 font-medium"
                    }`}
                  >
                    <span>{item.name}</span>
                    {user?.role === item.role && <Check className="w-3.5 h-3.5 text-[#76B900]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell matching reference image */}
        <div className="relative">
          <button
            onClick={() => onOpenCommandPalette()}
            className="relative p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#76B900] text-black text-[10px] font-bold flex items-center justify-center shadow-sm">
              3
            </span>
          </button>
        </div>

        {/* Right User Badge matching reference image */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs border border-zinc-800">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-zinc-900 leading-tight">
              {user?.role === Role.ADMIN ? "Admin" : user?.role || "Admin"}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>
    </header>
  );
};
