import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromToken } = useAuth();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      toastError(decodeURIComponent(errorParam));
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      setSessionFromToken(token)
        .then(() => {
          success("Authenticated successfully with Google");
          navigate("/dashboard", { replace: true });
        })
        .catch((err: any) => {
          toastError(err.message || "Failed to finalize session");
          navigate("/login", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setSessionFromToken, success, toastError]);

  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col items-center justify-center text-white text-xs font-mono">
      <div className="w-8 h-8 border-2 border-[#76B900] border-t-transparent rounded-full animate-spin mb-4" />
      <span>Finalizing VANTA secure session...</span>
    </div>
  );
};
