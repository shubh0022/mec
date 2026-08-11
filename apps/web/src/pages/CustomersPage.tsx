import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Clock,
  Send,
  Eye,
  Edit2
} from "lucide-react";
import { customersApi } from "../api/customers";
import {
  CustomerDto,
  CreateCustomerSchema,
  CreateCustomerInput,
  CreateFollowUpSchema,
  CreateFollowUpInput,
  CustomerType,
  CustomerStatus,
  Role
} from "@vanta/shared";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Fetch Customers
  const { data: response, isLoading } = useQuery({
    queryKey: ["customers", page, search, selectedStatus, selectedType],
    queryFn: () =>
      customersApi.getCustomers({
        page,
        limit: 15,
        search: search || undefined,
        status: selectedStatus || undefined,
        customerType: selectedType || undefined
      })
  });

  const customers = response?.data || [];
  const pagination = response?.pagination;

  // Form for creating customer
  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    reset: resetCustomerForm,
    formState: { errors: customerErrors, isSubmitting: isCreatingCustomer }
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE
    }
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerInput) => customersApi.createCustomer(data),
    onSuccess: (res) => {
      success(`Customer ${res.data?.customerName} registered with code ${res.data?.customerCode}`);
      setIsAddModalOpen(false);
      resetCustomerForm();
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to create customer");
    }
  });

  const onCustomerSubmit = (data: CreateCustomerInput) => {
    createCustomerMutation.mutate(data);
  };

  // Form for creating follow-up
  const {
    register: registerFollowUp,
    handleSubmit: handleSubmitFollowUp,
    reset: resetFollowUpForm,
    formState: { errors: followUpErrors, isSubmitting: isSubmittingFollowUp }
  } = useForm<CreateFollowUpInput>({
    resolver: zodResolver(CreateFollowUpSchema),
    defaultValues: {
      followUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
    }
  });

  const createFollowUpMutation = useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CreateFollowUpInput }) =>
      customersApi.createFollowUp(customerId, data),
    onSuccess: () => {
      success("Follow-up scheduled and added to CRM ledger");
      setIsFollowUpModalOpen(false);
      resetFollowUpForm();
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      if (selectedCustomer) {
        customersApi.getCustomerById(selectedCustomer.id).then((res) => {
          if (res.data) setSelectedCustomer(res.data);
        });
      }
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to record follow-up");
    }
  });

  const onFollowUpSubmit = (data: CreateFollowUpInput) => {
    if (!selectedCustomer) return;
    createFollowUpMutation.mutate({ customerId: selectedCustomer.id, data });
  };

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Customer Relationship Management</h2>
          <p className="text-xs text-zinc-500">Manage wholesale distributors, leads, and follow-up timeline</p>
        </div>
        {hasRole(Role.ADMIN, Role.SALES) && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Customer
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by customer name, code, business, phone or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#76B900]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Status filters */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
              {["", "ACTIVE", "LEAD", "INACTIVE"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    selectedStatus === st
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {st || "All Status"}
                </button>
              ))}
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
              {["", "WHOLESALE", "DISTRIBUTOR", "RETAIL"].map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    setSelectedType(tp);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    selectedType === tp
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {tp ? tp.charAt(0) + tp.slice(1).toLowerCase() : "All Types"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 text-zinc-600 font-bold border-b border-zinc-200">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Business</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Type</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Next Follow-up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    Loading customers catalog...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="text-zinc-500 font-medium">No customers found</div>
                    <div className="text-zinc-400 text-xs mt-1">Try adjusting search parameters or add a new customer</div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#497200]">
                      {c.customerCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {c.customerName}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 font-medium truncate max-w-[160px]">
                      {c.businessName}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                      <div>{c.mobile}</div>
                      {c.email && <div className="text-[10px] text-zinc-400">{c.email}</div>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={c.status}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      {c.followUpDate ? (
                        <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          {formatDate(c.followUpDate)}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          title="View Customer Profile & Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole(Role.ADMIN, Role.SALES) && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsFollowUpModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#497200] hover:bg-[#EAF7DD] transition-colors"
                            title="Schedule Follow-up"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50/50">
            <span className="text-xs text-zinc-500">
              Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} total customers)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && !isFollowUpModalOpen && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.customerName}
          subtitle={`Account Code: ${selectedCustomer.customerCode} • ${selectedCustomer.businessName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <div>
                <div className="text-zinc-400 font-medium">Type</div>
                <div className="font-bold text-zinc-800">{selectedCustomer.customerType}</div>
              </div>
              <div>
                <div className="text-zinc-400 font-medium">Status</div>
                <Badge variant={selectedCustomer.status}>{selectedCustomer.status}</Badge>
              </div>
              <div>
                <div className="text-zinc-400 font-medium">GST Number</div>
                <div className="font-mono font-semibold text-zinc-800">
                  {selectedCustomer.gstNumber || "Unregistered"}
                </div>
              </div>
              <div>
                <div className="text-zinc-400 font-medium">Created On</div>
                <div className="font-semibold text-zinc-800">{formatDate(selectedCustomer.createdAt)}</div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 border-b border-zinc-100 pb-4">
              <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">
                Contact & Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedCustomer.mobile}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              </div>
            </div>

            {/* Follow-up Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">
                  CRM Follow-up History (Ledger)
                </h4>
                {hasRole(Role.ADMIN, Role.SALES) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsFollowUpModalOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Follow-up
                  </Button>
                )}
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {selectedCustomer.followUps && selectedCustomer.followUps.length > 0 ? (
                  selectedCustomer.followUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-3"
                    >
                      <Clock className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-zinc-800">
                            Due: {formatDate(fu.followUpDate)}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            Logged: {formatDate(fu.createdAt)}
                          </span>
                        </div>
                        <p className="text-zinc-600 mt-1">{fu.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-400 bg-zinc-50 rounded-lg">
                    No follow-ups recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Follow-up Modal */}
      {selectedCustomer && isFollowUpModalOpen && (
        <Modal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title="Schedule Follow-up"
          subtitle={`Recording follow-up interaction for ${selectedCustomer.customerName}`}
        >
          <form onSubmit={handleSubmitFollowUp(onFollowUpSubmit)} className="space-y-4">
            <Input
              label="Follow-up Date"
              type="date"
              required
              error={followUpErrors.followUpDate?.message}
              {...registerFollowUp("followUpDate")}
            />
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Interaction Notes & Agenda <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Discussed Q3 order volume and credit term extension..."
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#76B900]"
                {...registerFollowUp("note")}
              />
              {followUpErrors.note && (
                <p className="text-xs text-red-500 mt-1">{followUpErrors.note.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFollowUpModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingFollowUp}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Save Follow-up
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer"
        subtitle="Add a new wholesale buyer, distributor, or retail lead"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitCustomer(onCustomerSubmit)} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Contact Name"
              placeholder="e.g. Rajesh Sharma"
              required
              error={customerErrors.customerName?.message}
              {...registerCustomer("customerName")}
            />
            <Input
              label="Business / Trading Name"
              placeholder="e.g. Apex Hardware Supplies Pvt Ltd"
              required
              error={customerErrors.businessName?.message}
              {...registerCustomer("businessName")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile Number"
              placeholder="+91 98200 12345"
              required
              error={customerErrors.mobile?.message}
              {...registerCustomer("mobile")}
            />
            <Input
              label="Email Address"
              placeholder="procurement@apex.in"
              error={customerErrors.email?.message}
              {...registerCustomer("email")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Customer Type
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white"
                {...registerCustomer("customerType")}
              >
                <option value={CustomerType.WHOLESALE}>Wholesale</option>
                <option value={CustomerType.DISTRIBUTOR}>Distributor</option>
                <option value={CustomerType.RETAIL}>Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Status
              </label>
              <select
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#76B900] bg-white"
                {...registerCustomer("status")}
              >
                <option value={CustomerStatus.ACTIVE}>Active</option>
                <option value={CustomerStatus.LEAD}>Lead</option>
                <option value={CustomerStatus.INACTIVE}>Inactive</option>
              </select>
            </div>

            <Input
              label="GST Number"
              placeholder="27AABCU9603R1ZM"
              error={customerErrors.gstNumber?.message}
              {...registerCustomer("gstNumber")}
            />
          </div>

          <Input
            label="Billing & Shipping Address"
            placeholder="Plot 44, Industrial Complex Phase 1..."
            required
            error={customerErrors.address?.message}
            {...registerCustomer("address")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Initial Follow-up Date (Optional)"
              type="date"
              error={customerErrors.followUpDate?.message}
              {...registerCustomer("followUpDate")}
            />
            <Input
              label="Initial Notes (Optional)"
              placeholder="Key requirements..."
              error={customerErrors.notes?.message}
              {...registerCustomer("notes")}
            />
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
            <Button type="submit" size="sm" isLoading={isCreatingCustomer}>
              Register Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
