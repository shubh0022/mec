import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Package,
  ArrowLeftRight,
  FileText,
  Receipt,
  BarChart3,
  TrendingUp,
  UserCog,
  ShieldCheck,
  ChevronsLeft,
  ChevronRight,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "@vanta/shared";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const navigationSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          roles: [Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]
        }
      ]
    },
    {
      title: "CRM",
      items: [
        {
          name: "Customers",
          path: "/customers",
          icon: Users,
          roles: [Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE]
        },
        {
          name: "Follow-ups",
          path: "/follow-ups",
          icon: CalendarClock,
          roles: [Role.ADMIN, Role.SALES, Role.ACCOUNTS]
        }
      ]
    },
    {
      title: "INVENTORY",
      items: [
        {
          name: "Products",
          path: "/products",
          icon: Package,
          roles: [Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]
        },
        {
          name: "Stock Movements",
          path: "/stock-movements",
          icon: ArrowLeftRight,
          roles: [Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS, Role.SALES]
        }
      ]
    },
    {
      title: "SALES",
      items: [
        {
          name: "Sales Challans",
          path: "/challans",
          icon: FileText,
          roles: [Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE]
        },
        {
          name: "Invoices",
          path: "/invoices",
          icon: Receipt,
          roles: [Role.ADMIN, Role.SALES, Role.ACCOUNTS]
        }
      ]
    },
    {
      title: "REPORTS",
      items: [
        {
          name: "Stock Report",
          path: "/reports/stock",
          icon: BarChart3,
          roles: [Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS]
        },
        {
          name: "Sales Report",
          path: "/reports/sales",
          icon: TrendingUp,
          roles: [Role.ADMIN, Role.SALES, Role.ACCOUNTS]
        }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        {
          name: "Users",
          path: "/users",
          icon: UserCog,
          roles: [Role.ADMIN]
        },
        {
          name: "Roles",
          path: "/roles",
          icon: ShieldCheck,
          roles: [Role.ADMIN]
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0B0F17] border-r border-[#1E293B] text-zinc-300 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E293B] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Geometric green logo icon */}
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#76B900]/40 flex items-center justify-center shrink-0 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#76B900"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex items-baseline tracking-tight">
                <span className="font-bold text-base text-white">miniERP</span>
                <span className="ml-1 text-xs font-extrabold text-[#76B900] tracking-wider uppercase">CRM</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              hasRole(...item.roles)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                          isActive
                            ? "bg-[#1E3A1A] text-white font-semibold border border-[#76B900]/30 shadow-inner"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                        }`
                      }
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-[#76B900]"
                            : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User Card matching reference image */}
        <div className="p-3 border-t border-[#1E293B] shrink-0 bg-[#070A10]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#111827]/80 border border-[#1E293B]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#76B900]/20 border border-[#76B900] flex items-center justify-center text-[#76B900] shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.name || "John Doe"}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">
                    {user?.role || "ADMIN"}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
