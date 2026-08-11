import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/dashboard";
import { KpiCard } from "../components/dashboard/KpiCard";
import { SalesChart } from "../components/dashboard/SalesChart";
import { RecentChallansTable } from "../components/dashboard/RecentChallansTable";
import { LowStockAlertTable } from "../components/dashboard/LowStockAlertTable";
import { FollowUpsTable } from "../components/dashboard/FollowUpsTable";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { Role } from "@vanta/shared";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const {
    data: response,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => dashboardApi.getSummary(),
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-200 rounded-xl"></div>
          ))}
        </div>
        {/* Middle skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-200 rounded-xl"></div>
          <div className="h-80 bg-zinc-200 rounded-xl"></div>
        </div>
        {/* Bottom skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-200 rounded-xl"></div>
          <div className="h-80 bg-zinc-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-zinc-900">Failed to load dashboard metrics</h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          Please verify that the backend server is running and accessible.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const { kpis, salesOverview, recentChallans, lowStockAlerts, followUpsDue } = response.data;

  return (
    <div className="space-y-6">
      {/* Quick Action Header for Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Operations Overview</h2>
          <p className="text-xs text-zinc-500">Live operational telemetry and real-time inventory ledger</p>
        </div>
        <div className="flex items-center gap-2">
          {hasRole(Role.ADMIN, Role.SALES) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate("/challans/new")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Sales Challan
            </Button>
          )}
          {hasRole(Role.ADMIN, Role.SALES) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/customers?action=new")}
            >
              + Customer
            </Button>
          )}
          {hasRole(Role.ADMIN, Role.WAREHOUSE) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/products?action=new")}
            >
              + Product
            </Button>
          )}
        </div>
      </div>

      {/* 4 KPI Summary Cards matching reference image layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Customers"
          value={kpis.totalCustomers.toLocaleString("en-IN")}
          icon={Users}
          trend={kpis.customersTrend}
        />
        <KpiCard
          title="Total Products"
          value={kpis.totalProducts.toLocaleString("en-IN")}
          icon={Package}
          trend={kpis.productsTrend}
        />
        <KpiCard
          title="Low Stock Items"
          value={kpis.lowStockItemsCount}
          icon={AlertTriangle}
          viewAllLink="/products?lowStock=true"
        />
        <KpiCard
          title="Sales (This Month)"
          value={`₹ ${kpis.salesThisMonth.toLocaleString("en-IN")}`}
          icon={BarChart3}
          trend={kpis.salesMonthTrend}
        />
      </div>

      {/* Middle Row: Sales Overview Spline Chart + Recent Sales Challans Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <SalesChart data={salesOverview} />
        <RecentChallansTable challans={recentChallans} />
      </div>

      {/* Bottom Row: Low Stock Alert Table + Follow-ups Due Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <LowStockAlertTable products={lowStockAlerts} />
        <FollowUpsTable followUps={followUpsDue} />
      </div>
    </div>
  );
};
