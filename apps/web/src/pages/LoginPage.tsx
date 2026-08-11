import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, KeyRound, ArrowRight, UserCheck } from "lucide-react";
import { LoginSchema, LoginInput, Role } from "@vanta/shared";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleQuickLogin = async (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
    setIsLoading(true);
    try {
      await login({ email, password: "password123" });
      success(`Logged in as ${email}`);
      navigate("/dashboard");
    } catch (err: any) {
      toastError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@example.com", role: "ADMIN", name: "John Doe", desc: "Full administrative access" },
    { email: "sales@example.com", role: "SALES", name: "Jane Smith", desc: "Customers & Challans" },
    { email: "warehouse@example.com", role: "WAREHOUSE", name: "Mike Johnson", desc: "Inventory & Stock ledger" },
    { email: "accounts@example.com", role: "ACCOUNTS", name: "Sarah Connor", desc: "Invoices & financial reports" }
  ];

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Geometric Logo */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-900 border border-[#76B900]/40 flex items-center justify-center shadow-lg shadow-[#76B900]/10 mb-3">
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
        <h1 className="text-2xl font-extrabold tracking-tight text-white">VANTA ERP</h1>
        <p className="text-xs text-zinc-400 mt-1">Operations Intelligence Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0E131F] py-8 px-6 sm:px-10 rounded-2xl border border-[#1E293B] shadow-2xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full text-xs p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-3">
              One-Click Demo Personas
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-[#76B900]/50 hover:bg-zinc-850 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white group-hover:text-[#76B900]">
                      {acc.role}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76B900]"></span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
