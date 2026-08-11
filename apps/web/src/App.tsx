import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { NotFoundPage } from "./pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A10] flex items-center justify-center text-white text-xs font-mono">
        Initializing VANTA Secure Portal...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

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
                <Route path="users" element={<UsersPage />} />
                <Route path="roles" element={<UsersPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
