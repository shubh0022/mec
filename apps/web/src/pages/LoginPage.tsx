import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  Package,
  Receipt,
  Users,
  Check,
  Sparkles,
  LockKeyholeOpen
} from "lucide-react";
import { Role } from "@vanta/shared";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";

interface GuestRoleConfig {
  role: Role;
  name: string;
  badge: string;
  summary: string;
  permissions: string[];
  icon: React.ElementType;
  accentColor: string;
  badgeStyle: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const { success, error: toastError } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.ADMIN);
  const [isLoading, setIsLoading] = useState(false);

  const guestRoles: GuestRoleConfig[] = [
    {
      role: Role.ADMIN,
      name: "Administrator",
      badge: "Full System Access",
      summary: "Executive authority over all operations, RBAC policies, inventory audits, and system settings.",
      permissions: ["Full CRUD Operations", "User & RBAC Controls", "Challan Approvals", "Financial Ledgers"],
      icon: Shield,
      accentColor: "#76B900",
      badgeStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      role: Role.SALES,
      name: "Sales Officer",
      badge: "CRM & Pipelines",
      summary: "Customer relationship database, lead follow-ups, quotation generation, and sales challan creation.",
      permissions: ["Customer Directory", "Follow-up Tracker", "Quotation & Orders", "Sales Dispatch"],
      icon: Users,
      accentColor: "#3B82F6",
      badgeStyle: "text-blue-400 bg-blue-500/10 border-blue-500/30"
    },
    {
      role: Role.WAREHOUSE,
      name: "Warehouse Manager",
      badge: "Inventory & Logistics",
      summary: "Real-time stock ledger, batch tracking, multi-warehouse auditing, and dispatch fulfillment.",
      permissions: ["Real-time Stock Ledger", "Warehouse Movement", "Inventory Adjustments", "Dispatch Verification"],
      icon: Package,
      accentColor: "#F59E0B",
      badgeStyle: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    {
      role: Role.ACCOUNTS,
      name: "Accounts Officer",
      badge: "Finance & GST",
      summary: "Tax invoicing, GST compliance calculations, accounts receivable tracking, and revenue analytics.",
      permissions: ["GST Tax Invoicing", "Payment Reconciliation", "Accounts Ledger", "Revenue Analytics"],
      icon: Receipt,
      accentColor: "#A855F7",
      badgeStyle: "text-purple-400 bg-purple-500/10 border-purple-500/30"
    }
  ];

  const currentRoleConfig = guestRoles.find((r) => r.role === selectedRole) || guestRoles[0];

  const handleLaunchGuestWorkspace = async (roleToLaunch: Role = selectedRole) => {
    setIsLoading(true);
    const targetConfig = guestRoles.find((r) => r.role === roleToLaunch) || currentRoleConfig;
    try {
      await demoLogin(roleToLaunch);
      success(`Authenticated as Guest ${targetConfig.name}. Launching workspace...`);
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err.message || "Failed to initialize guest session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#76B900]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[250px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="w-full max-w-2xl text-center relative z-10 mb-6">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#0E131F] border border-[#76B900]/40 flex items-center justify-center shadow-lg shadow-[#76B900]/10 mb-3.5 ring-4 ring-[#76B900]/5 transition-transform hover:scale-105 duration-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#76B900"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>VANTA</span>
          <span className="text-[#76B900] font-light">ERP</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Operations Intelligence, Multi-Role ERP & CRM Platform
        </p>
      </div>

      {/* Main Unified Guest Portal Card */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-[#0E131F] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* Section Header */}
          <div className="p-6 sm:p-7 border-b border-zinc-800/80 bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 mb-1.5">
                  <LockKeyholeOpen className="w-3 h-3" />
                  <span>Direct Guest Access</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Select Guest Persona
                </h2>
                <p className="text-xs text-zinc-400">
                  Choose an executive role to explore permissions, live workflows, and data access.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#76B900]" />
                <span>No password required</span>
              </div>
            </div>
          </div>

          {/* Role Selection Grid */}
          <div className="p-6 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guestRoles.map((roleConfig) => {
                const Icon = roleConfig.icon;
                const isSelected = selectedRole === roleConfig.role;

                return (
                  <div
                    key={roleConfig.role}
                    onClick={() => setSelectedRole(roleConfig.role)}
                    onDoubleClick={() => handleLaunchGuestWorkspace(roleConfig.role)}
                    className={`relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#162033] border-[#76B900] shadow-md shadow-[#76B900]/10 ring-1 ring-[#76B900]/40"
                        : "bg-[#111726]/80 border-zinc-800 hover:border-zinc-700 hover:bg-[#141C2E]"
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon, Title, Badge & Check */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/50"
                                : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{roleConfig.name}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-medium">
                              {roleConfig.role}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleConfig.badgeStyle}`}
                          >
                            {roleConfig.badge}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#76B900] text-black flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {roleConfig.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Persona Summary Bar */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#76B900] animate-pulse" />
                <span className="text-zinc-400">
                  Ready to enter as: <strong className="text-white font-semibold">{currentRoleConfig.name}</strong> ({currentRoleConfig.role})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentRoleConfig.permissions.slice(0, 2).map((perm, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                  >
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Unified Single Action Launch Button */}
            <Button
              type="button"
              variant="primary"
              onClick={() => handleLaunchGuestWorkspace(selectedRole)}
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full py-3.5 text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-[#76B900]/20 flex items-center justify-center gap-2 group transition-all"
            >
              <Zap className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span>Launch Workspace as {currentRoleConfig.name}</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Footer Strip */}
          <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Live Demonstration Sandbox • Switch roles anytime from topbar</span>
            </div>
            <div className="font-mono text-zinc-500 text-[10px]">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
