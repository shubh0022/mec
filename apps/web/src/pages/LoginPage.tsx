import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  UserCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Package,
  Receipt,
  Users,
  KeyRound
} from "lucide-react";
import { Role } from "@vanta/shared";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";

interface GuestPersona {
  role: Role;
  name: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
  badgeBg: string;
  accentBorder: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonaLoading, setActivePersonaLoading] = useState<Role | null>(null);

  const guestPersonas: GuestPersona[] = [
    {
      role: Role.ADMIN,
      name: "Administrator",
      title: "System Admin & Superuser",
      desc: "Full ERP authority, system settings, user access, inventory & challan approvals",
      icon: Shield,
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      badgeBg: "hover:border-emerald-500/60",
      accentBorder: "group-hover:border-emerald-500/40"
    },
    {
      role: Role.SALES,
      name: "Sales Officer",
      title: "Sales & CRM Lead",
      desc: "Customer directory, follow-up logs, quotation creation & sales challans",
      icon: Users,
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      badgeBg: "hover:border-blue-500/60",
      accentBorder: "group-hover:border-blue-500/40"
    },
    {
      role: Role.WAREHOUSE,
      name: "Warehouse Manager",
      title: "Inventory & Dispatch",
      desc: "Stock ledger, multi-warehouse inventory audits & goods dispatch verification",
      icon: Package,
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      badgeBg: "hover:border-amber-500/60",
      accentBorder: "group-hover:border-amber-500/40"
    },
    {
      role: Role.ACCOUNTS,
      name: "Accounts Officer",
      title: "Finance & Taxation",
      desc: "GST invoices, payment tracking, accounts ledger & revenue analytics",
      icon: Receipt,
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      badgeBg: "hover:border-purple-500/60",
      accentBorder: "group-hover:border-purple-500/40"
    }
  ];

  const handleGuestLogin = async (role: Role = Role.ADMIN, personaName?: string) => {
    setActivePersonaLoading(role);
    setIsLoading(true);
    try {
      await demoLogin(role);
      success(`Welcome! Logged in as Guest (${personaName || role})`);
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err.message || "Failed to enter guest mode");
    } finally {
      setActivePersonaLoading(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#76B900]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center relative z-10">
        {/* Geometric Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0E131F] border border-[#76B900]/40 flex items-center justify-center shadow-xl shadow-[#76B900]/10 mb-4 ring-4 ring-[#76B900]/5 transition-transform hover:scale-105 duration-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#76B900"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>VANTA</span>
          <span className="text-[#76B900] font-light">ERP</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          Operations Intelligence, Inventory Ledger & Multi-Role Enterprise Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-[#0E131F] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden">
          {/* Top Quick Guest Enter Hero Banner */}
          <div className="p-6 sm:p-8 border-b border-zinc-800/80 bg-linear-to-b from-[#141B2D]/80 to-zinc-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Guest Access Only • No Password Required</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Instant Guest Login
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct access with full permissions enabled. Click below to enter the portal immediately.
                </p>
              </div>
            </div>

            {/* Primary One-Click Guest Entry Button */}
            <Button
              type="button"
              variant="primary"
              onClick={() => handleGuestLogin(Role.ADMIN, "Administrator")}
              disabled={isLoading}
              isLoading={isLoading && activePersonaLoading === Role.ADMIN}
              className="w-full py-4 text-sm font-bold tracking-wide shadow-lg shadow-[#76B900]/20 flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span>Enter as Guest (Full Admin Access)</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Role selection section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Or Enter With Specific Guest Role
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Test role-based access control and customized workflows
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Guest Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {guestPersonas.map((persona) => {
                const Icon = persona.icon;
                const isThisLoading = activePersonaLoading === persona.role;

                return (
                  <div
                    key={persona.role}
                    className={`group relative p-4 rounded-xl bg-[#141B2D]/90 border border-zinc-800/90 ${persona.badgeBg} hover:bg-[#1A233A] transition-all duration-200 shadow-sm flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:border-[#76B900]/60 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {persona.name}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {persona.title}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${persona.badgeColor}`}
                        >
                          {persona.role}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3.5 leading-relaxed">
                        {persona.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGuestLogin(persona.role, persona.name)}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-[#76B900] text-zinc-300 hover:text-black text-xs font-bold border border-zinc-700 hover:border-[#76B900] transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isThisLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Enter as {persona.role}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer with Security Badge */}
          <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Guest Sandbox Environment Ready</span>
            </div>
            <div className="font-mono text-zinc-500 text-[10px]">
              Instant Access Mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
