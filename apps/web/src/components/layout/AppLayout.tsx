import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../common/CommandPalette";
import { DemoBanner } from "../common/DemoBanner";

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/customers")) return "Customers CRM";
    if (path.startsWith("/follow-ups")) return "Follow-ups Ledger";
    if (path.startsWith("/products")) return "Product Inventory";
    if (path.startsWith("/stock-movements")) return "Stock Movements Ledger";
    if (path.startsWith("/challans/new")) return "Create Sales Challan";
    if (path.startsWith("/challans")) return "Sales Challans";
    if (path.startsWith("/invoices")) return "Invoices & Billing";
    if (path.startsWith("/reports/stock")) return "Stock Inventory Report";
    if (path.startsWith("/reports/sales")) return "Sales Performance Report";
    if (path.startsWith("/users")) return "User Management";
    if (path.startsWith("/roles")) return "Role & Permission Matrix";
    return "Operations Intelligence";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Navigation Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Topbar
          title={getPageTitle()}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <DemoBanner />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Enterprise Footer matching reference image */}
        <footer className="px-6 py-4 border-t border-zinc-200 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
          <div>© 2026 miniERP CRM (VANTA ERP). All rights reserved.</div>
          <div className="font-mono text-zinc-400">Version 1.0.0</div>
        </footer>
      </div>

      {/* Keyboard-driven Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
