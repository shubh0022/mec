import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Package,
  FileText,
  PlusCircle,
  Shield,
  ArrowRight
} from "lucide-react";
import { Role } from "@vanta/shared";
import { useAuth } from "../../context/AuthContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { switchDemoRole } = useAuth();

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
      id: "new-challan",
      name: "Create Sales Challan",
      category: "Quick Actions",
      icon: <PlusCircle className="w-4 h-4 text-[#76B900]" />,
      action: () => {
        navigate("/challans/new");
        onClose();
      }
    },
    {
      id: "view-customers",
      name: "View Customers CRM",
      category: "Navigation",
      icon: <Users className="w-4 h-4 text-zinc-400" />,
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
      action: () => {
        navigate("/challans");
        onClose();
      }
    },
    {
      id: "switch-admin",
      name: "Switch to Admin Role (John Doe)",
      category: "Demo Roles",
      icon: <Shield className="w-4 h-4 text-[#76B900]" />,
      action: async () => {
        await switchDemoRole(Role.ADMIN);
        onClose();
      }
    },
    {
      id: "switch-sales",
      name: "Switch to Sales Role (Jane Smith)",
      category: "Demo Roles",
      icon: <Shield className="w-4 h-4 text-[#76B900]" />,
      action: async () => {
        await switchDemoRole(Role.SALES);
        onClose();
      }
    },
    {
      id: "switch-warehouse",
      name: "Switch to Warehouse Role (Mike Johnson)",
      category: "Demo Roles",
      icon: <Shield className="w-4 h-4 text-[#76B900]" />,
      action: async () => {
        await switchDemoRole(Role.WAREHOUSE);
        onClose();
      }
    }
  ];

  const filtered = actions.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto max-w-xl transform overflow-hidden rounded-xl bg-white shadow-2xl border border-zinc-200 transition-all">
        <div className="flex items-center px-4 border-b border-zinc-200">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full h-12 text-sm text-zinc-900 placeholder-zinc-400 bg-transparent border-0 focus:outline-none focus:ring-0"
            placeholder="Type a command or search (e.g. 'Challan', 'Customers', 'Admin')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-zinc-400 bg-zinc-100 rounded border border-zinc-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-zinc-500">No matching commands found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{item.category}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
