import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shield,
  KeyRound,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Zap,
  Sparkles,
  CheckCircle2,
  Building2,
  Package,
  Receipt,
  Users
} from "lucide-react";
import { LoginSchema, LoginInput, Role } from "@vanta/shared";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";

interface DemoPersona {
  email: string;
  role: Role;
  name: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
  badgeBg: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonaLoading, setActivePersonaLoading] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password123"
    }
  });

  const demoAccounts: DemoPersona[] = [
    {
      email: "admin@example.com",
      role: Role.ADMIN,
      name: "John Doe",
      title: "System Administrator",
      desc: "Full ERP authority, system settings, user access, and challan approvals",
      icon: Shield,
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      badgeBg: "hover:border-emerald-500/60"
    },
    {
      email: "sales@example.com",
      role: Role.SALES,
      name: "Jane Smith",
      title: "Sales & CRM Officer",
      desc: "Customer database, follow-up logs, quotation & sales challan creation",
      icon: Users,
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      badgeBg: "hover:border-blue-500/60"
    },
    {
      email: "warehouse@example.com",
      role: Role.WAREHOUSE,
      name: "Mike Johnson",
      title: "Warehouse Manager",
      desc: "Live stock ledger, multi-warehouse inventory audits & goods dispatch",
      icon: Package,
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      badgeBg: "hover:border-amber-500/60"
    },
    {
      email: "accounts@example.com",
      role: Role.ACCOUNTS,
      name: "Sarah Connor",
      title: "Accounts & Finance",
      desc: "GST tax invoices, payment tracking, accounts ledger & revenue analytics",
      icon: Receipt,
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      badgeBg: "hover:border-purple-500/60"
    }
  ];

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data);
      success("Authenticated successfully. Welcome back to VANTA ERP.");
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (persona: DemoPersona) => {
    setActivePersonaLoading(persona.role);
    setValue("email", persona.email);
    setValue("password", "password123");
    try {
      await demoLogin(persona.role);
      success(`Authenticated as ${persona.name} (${persona.title})`);
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err.message || "Demo login failed");
    } finally {
      setActivePersonaLoading(null);
    }
  };

  const handleAutofillOnly = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
    success(`Autofilled credentials for ${email}`);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#76B900]/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />

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
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Operations Intelligence, Inventory Ledger & Multi-Role ERP Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-[#0E131F] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden">
          {/* Top Demo Personas Section */}
          <div className="p-6 sm:p-8 border-b border-zinc-800/80 bg-zinc-950/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#76B900]/20 border border-[#76B900]/40 flex items-center justify-center text-[#76B900]">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                    <span>One-Click Demo Personas</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40 rounded">
                      Instant Access
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Click any role below to instantly explore permissions & workflows
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Demo Persona Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((persona) => {
                const Icon = persona.icon;
                const isThisLoading = activePersonaLoading === persona.role;

                return (
                  <div
                    key={persona.role}
                    className={`group relative p-3.5 rounded-xl bg-[#141B2D]/90 border border-zinc-800/90 ${persona.badgeBg} hover:bg-[#1A233A] transition-all duration-200 shadow-sm flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:border-[#76B900]/60 group-hover:text-white transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{persona.name}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate font-mono">
                              {persona.email}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${persona.badgeColor}`}
                        >
                          {persona.role}
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {persona.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                      <button
                        type="button"
                        disabled={isThisLoading || isLoading}
                        onClick={() => handleQuickDemoLogin(persona)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#76B900] hover:bg-[#68a400] text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {isThisLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Sign In</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAutofillOnly(persona.email)}
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-medium border border-zinc-700 transition-colors"
                        title="Autofill form inputs"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Login Form Section */}
          <div className="p-6 sm:p-8">
            <div className="text-xs font-semibold text-zinc-400 mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-zinc-800" />
              <span className="uppercase tracking-wider text-[10px] text-zinc-500 font-bold">
                Or Sign In With Custom Credentials
              </span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Work Email Address</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Default: admin@example.com
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition-colors"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Default: password123
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition-colors"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-[#76B900] focus:ring-[#76B900] focus:ring-offset-0"
                  />
                  <span className="text-xs text-zinc-400">Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleAutofillOnly("admin@example.com")}
                  className="text-xs text-[#76B900] hover:underline font-medium"
                >
                  Reset to Admin Default
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 mt-2 text-xs font-bold tracking-wide"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to VANTA Portal
              </Button>
            </form>
          </div>

          {/* Footer with Security Badge */}
          <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900]" />
              <span>JWT Authentication & RBAC Policy Enforced</span>
            </div>
            <div className="font-mono text-zinc-400 text-[10px]">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

