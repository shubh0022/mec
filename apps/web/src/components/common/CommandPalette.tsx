import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Package,
  FileText,
  PlusCircle,
  BarChart3,
  Receipt,
  LayoutDashboard,
  LogOut,
  ArrowRight
} from "lucide-react";
import { Permission } from "@vanta/shared";
import { useAuth } from "../../context/AuthContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, can, logout, isGuest } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "dashboard",
      name: "Go to Dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="w-4 h-4 text-zinc-400" />,
      show: true,
      action: () => {
        navigate("/dashboard");
        onClose();
      }
    },
    {
      id: "new-challan",
      name: "Create Sales Challan",
      category: "Quick Actions",
      icon: <PlusCircle className="w-4 h-4 text-[#76B900]" />,
      show: can(Permission.CHALLAN_CREATE),
      action: () => {
        navigate("/challans/new");
        onClose();
      }
    },
    {
      id: "view-customers",
      name: "View Customers Directory",
      category: "Navigation",
      icon: <Users className="w-4 h-4 text-zinc-400" />,
      show: can(Permission.CUSTOMER_VIEW),
      action: () => {
        navigate("/customers");
        onClose();
      }
    },
    {
      id: "view-products",
      name: "View Inventory Catalog",
      category: "Navigation",
      icon: <Package className="w-4 h-4 text-zinc-400" />,
      show: can(Permission.PRODUCT_VIEW),
      action: () => {
        navigate("/products");
        onClose();
      }
    },
    {
      id: "view-challans",
      name: "View Sales Challans",
      category: "Navigation",
      icon: <FileText className="w-4 h-4 text-zinc-400" />,
      show: can(Permission.CHALLAN_VIEW),
      action: () => {
        navigate("/challans");
        onClose();
      }
    },
    {
      id: "view-invoices",
      name: "View Invoices & Billing",
      category: "Navigation",
      icon: <Receipt className="w-4 h-4 text-zinc-400" />,
      show: can(Permission.INVOICE_VIEW),
      action: () => {
        navigate("/invoices");
        onClose();
      }
    },
    {
      id: "view-reports",
      name: "View Stock Inventory Report",
      category: "Reports",
      icon: <BarChart3 className="w-4 h-4 text-zinc-400" />,
      show: can(Permission.REPORT_VIEW),
      action: () => {
        navigate("/reports/stock");
        onClose();
      }
    },
    {
      id: "logout",
      name: isGuest ? "Exit Demo Session" : "Sign Out of Workspace",
      category: "Session",
      icon: <LogOut className="w-4 h-4 text-red-400" />,
      show: true,
      action: () => {
        onClose();
        logout();
      }
    }
  ];

  const filteredActions = actions.filter(
    (action) =>
      action.show &&
      (action.name.toLowerCase().includes(query.toLowerCase()) ||
        action.category.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-xl rounded-2xl bg-[#0E131F] border border-[#1E293B] shadow-2xl overflow-hidden transition-all">
        <div className="flex items-center px-4 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            className="w-full h-14 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-900 rounded border border-zinc-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-800/50">
          {filteredActions.length > 0 ? (
            filteredActions.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/70 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">{item.category}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#76B900] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-zinc-500">
              No matching commands or actions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
