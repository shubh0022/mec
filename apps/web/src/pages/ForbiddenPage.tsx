import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 ring-8 ring-red-500/5">
        <Lock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
        <span>403 Access Denied</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
        Restricted Workspace Resource
      </h1>

      <p className="text-sm text-zinc-500 max-w-md mb-6 leading-relaxed">
        {isGuest
          ? "This resource requires elevated employee permissions. Administrative and sensitive modules are restricted in Guest Demo Mode."
          : `Your account role (${user?.role || "USER"}) does not have the necessary RBAC permissions to access this page.`}
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
