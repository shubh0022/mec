import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Activity,
  Layers,
  Database,
  CheckCircle2,
  X
} from "lucide-react";
import { LoginSchema, LoginInput } from "@vanta/shared";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, login, continueWithGoogleOAuth, continueAsGuest } = useAuth();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const fromPath = (location.state as any)?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, navigate, fromPath]);

  // Handle URL query error parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login(data);
      success("Authenticated successfully. Welcome back to VANTA ERP.");
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Email or password is incorrect.";
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await continueWithGoogleOAuth();
    } catch (err: any) {
      const msg = err?.message || "Google sign-in could not be completed. Please try again.";
      setErrorMessage(msg);
      toastError(msg);
      setIsGoogleLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setErrorMessage(null);
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
      setShowGuestModal(false);
      success("Entered VANTA in Demo Mode. Read-only access enabled.");
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Failed to initialize guest demo session. Please try again.";
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Precision ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#76B900]/8 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-[#76B900]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main 2-Column Responsive Container */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Brand & Context (Desktop Focused) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
          {/* Logo Mark */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#111111] border border-[#76B900]/40 flex items-center justify-center shadow-lg shadow-[#76B900]/10 ring-2 ring-[#76B900]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#76B900"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-2xl font-extrabold text-white">VANTA</span>
                <span className="ml-1.5 text-xs font-semibold text-[#76B900] tracking-widest uppercase">ERP</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Operations Intelligence</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage customers, inventory and sales from one workspace.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
              Enterprise-grade operations ledger, real-time multi-warehouse inventory auditing, and role-based operational workflows.
            </p>
          </div>

          {/* Technical Trust Points (Hidden on small mobile) */}
          <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#121212]/90 border border-zinc-800/90 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Strict RBAC Policies</div>
                <div className="text-[10px] text-zinc-400">Least-privilege authorization</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#121212]/90 border border-zinc-800/90 flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">99.99% Ledger Uptime</div>
                <div className="text-[10px] text-zinc-400">Atomic inventory locking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-[#111111] rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md relative">
            
            {/* Card Header */}
            <div className="mb-6 text-left">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Email + Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition-colors"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-400 text-[11px] mt-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-zinc-400 hover:text-[#76B900] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={!!errors.password}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition-colors"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-red-400 text-[11px] mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Action */}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold tracking-wide mt-2"
                isLoading={isLoading}
                disabled={isLoading || isGoogleLoading || isGuestLoading}
                rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-[#111111] px-3 text-zinc-500 font-bold">OR</span>
              </div>
            </div>

            {/* Alternative Authentication Paths */}
            <div className="space-y-2.5">
              {/* Real Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isGuestLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all duration-150 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={() => setShowGuestModal(true)}
                disabled={isLoading || isGoogleLoading || isGuestLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#76B900]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Continue as Guest</span>
              </button>
            </div>

            {/* Footer / Privacy notice */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
              <span>VANTA ERP v1.0.0</span>
              <span>Encrypted Session • TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Demo Confirmation Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-modal-title"
            className="bg-[#111111] rounded-2xl border border-zinc-800 shadow-2xl max-w-sm w-full p-6 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#76B900]/15 border border-[#76B900]/30 flex items-center justify-center text-[#76B900] mb-4">
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 id="guest-modal-title" className="text-base font-bold text-white mb-1.5">
              Explore VANTA in demo mode?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Demo access is read-only and does not modify production data. You will be able to explore live dashboards, inventory reports, and catalog records in an isolated sandbox.
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGuestModal(false)}
                className="flex-1 text-xs"
                disabled={isGuestLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGuestEntry}
                isLoading={isGuestLoading}
                className="flex-1 text-xs font-bold"
              >
                Enter Demo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-modal-title"
            className="bg-[#111111] rounded-2xl border border-zinc-800 shadow-2xl max-w-sm w-full p-6 text-left relative"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-4">
              <Lock className="w-5 h-5" />
            </div>

            <h3 id="forgot-modal-title" className="text-base font-bold text-white mb-1.5">
              Password Reset
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              In accordance with VANTA ERP security policy, credentials must be reset by your organization&apos;s System Administrator. Please contact your administrator or IT helpdesk.
            </p>

            <Button
              variant="outline"
              onClick={() => setShowForgotModal(false)}
              className="w-full text-xs font-semibold"
            >
              Understood
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
