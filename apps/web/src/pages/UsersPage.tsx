import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserCheck, Shield, KeyRound, User } from "lucide-react";
import { usersApi } from "../api/users";
import { CreateUserSchema, CreateUserInput, Role } from "@vanta/shared";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { useToast } from "../context/ToastContext";

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getUsers({ limit: 50 })
  });

  const users = response?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      role: Role.SALES,
      isActive: true
    }
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.createUser(data),
    onSuccess: (res) => {
      success(`User account created for ${res.data?.name} (${res.data?.role})`);
      setIsAddModalOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to create user");
    }
  });

  const onSubmit = (data: CreateUserInput) => {
    createUserMutation.mutate(data);
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">User Administration & RBAC</h2>
          <p className="text-xs text-zinc-500">Manage portal team members, role assignments, and access policies</p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Team Member
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Assigned Role</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    Loading user directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/60">
                    <td className="py-3 px-4 font-semibold text-zinc-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#EAF7DD] text-[#497200] border border-[#B8E48F]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={u.isActive ? "active" : "inactive"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Matrix Reference */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
          Role-Based Access Control (RBAC) Permission Matrix
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3 text-center">ADMIN</th>
                <th className="py-2.5 px-3 text-center">SALES</th>
                <th className="py-2.5 px-3 text-center">WAREHOUSE</th>
                <th className="py-2.5 px-3 text-center">ACCOUNTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              <tr>
                <td className="py-2 px-3 font-semibold">Customers CRM & Follow-ups</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Create & Manage</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Product Catalog</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Create & Update</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Manual Stock Adjustments</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-red-500 font-semibold">Blocked</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-red-500 font-semibold">Blocked</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Sales Challans & Dispatch</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Full Access</td>
                <td className="py-2 px-3 text-center text-[#497200] font-bold">Draft & Confirm</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
                <td className="py-2 px-3 text-center text-zinc-400">View Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        subtitle="Provision portal login credentials and assign RBAC role"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Assigned Portal Role <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white font-semibold"
              {...register("role")}
            >
              <option value={Role.ADMIN}>ADMIN (Full system access)</option>
              <option value={Role.SALES}>SALES (CRM & Challans)</option>
              <option value={Role.WAREHOUSE}>WAREHOUSE (Stock & Inventory)</option>
              <option value={Role.ACCOUNTS}>ACCOUNTS (Financials & Reports)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
