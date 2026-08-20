import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { StockMovementsPage } from "./pages/StockMovementsPage";
import { SalesChallansPage } from "./pages/SalesChallansPage";
import { CreateChallanPage } from "./pages/CreateChallanPage";
import { ChallanDetailPage } from "./pages/ChallanDetailPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Role, Permission } from "@vanta/shared";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission
}) => {
  const { user, isLoading, can, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white text-xs font-mono">
        <div className="w-8 h-8 border-2 border-[#76B900] border-t-transparent rounded-full animate-spin mb-3" />
        <span>Initializing VANTA Secure Portal...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected Portal Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="follow-ups" element={<FollowUpsPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="stock-movements" element={<StockMovementsPage />} />
                <Route path="challans" element={<SalesChallansPage />} />
                <Route path="challans/new" element={<CreateChallanPage />} />
                <Route path="challans/:id" element={<ChallanDetailPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="reports/stock" element={<ReportsPage type="stock" />} />
                <Route path="reports/sales" element={<ReportsPage type="sales" />} />

                {/* Restricted Admin-only routes */}
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={[Role.ADMIN]} requiredPermission={Permission.USER_MANAGE}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="roles"
                  element={
                    <ProtectedRoute allowedRoles={[Role.ADMIN]} requiredPermission={Permission.ROLE_MANAGE}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="403" element={<ForbiddenPage />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
