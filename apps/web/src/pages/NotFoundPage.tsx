import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-6xl font-extrabold text-[#76B900] mb-2">404</div>
      <h1 className="text-xl font-bold text-white">Page Not Found</h1>
      <p className="text-xs text-zinc-400 max-w-sm mt-2 mb-6">
        The requested portal module or resource route does not exist.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
