import { useState, useMemo, useCallback } from "react";
import { useStaffPaginated, useStaffMetrics, useDeleteStaff } from "@/hooks/useStaff";
import { useDebounce } from "@/hooks/useDebounce";
import type { Staff as StaffType } from "@/lib/staff.api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  StaffMetrics,
  StaffFilters,
  StaffTable,
  CreateStaffModal,
  EditStaffModal,
  DeleteStaffDialog,
  type StatusFilterOption,
} from "@/components/staff";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Staff() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: StatusFilterOption) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      isActive:
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      page,
    };
  }, [debouncedSearch, statusFilter, page]);

  // TanStack Query: Paginated Staff Roster
  const { data: staffResponse, isLoading } = useStaffPaginated(queryParams, {
    enabled: isAdmin,
  });
  const staff = staffResponse?.data || [];
  const paginationMeta = staffResponse?.pagination;

  // Lightweight server-side metrics
  const { data: metrics } = useStaffMetrics({ enabled: isAdmin });

  const deleteMutation = useDeleteStaff();

  // Modal Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffType | null>(null);

  // Aggregate Metrics
  const totalCount = metrics?.totalCount ?? paginationMeta?.total ?? 0;
  const activeCount = metrics?.activeCount ?? 0;
  const inactiveCount = metrics?.inactiveCount ?? Math.max(0, totalCount - activeCount);

  // Stable callbacks for child components to prevent re-renders
  const handleOpenAdd = useCallback(() => setIsAddModalOpen(true), []);
  const handleCloseAdd = useCallback(() => setIsAddModalOpen(false), []);
  const handleEdit = useCallback((member: StaffType) => setEditingStaff(member), []);
  const handleCloseEdit = useCallback(() => setEditingStaff(null), []);
  const handleDelete = useCallback((member: StaffType) => setDeletingStaff(member), []);
  const handleCloseDelete = useCallback(() => setDeletingStaff(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingStaff) return;
    await deleteMutation.mutateAsync(deletingStaff.id);
    setDeletingStaff(null);
  }, [deletingStaff, deleteMutation]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Register, inspect, update, and manage administrative and operational staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Register Staff
          </Button>
        </div>
      </div>

      {/* Metrics Section (Memoized) */}
      <StaffMetrics
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      {/* Search & Filter Controls (Memoized) */}
      <StaffFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      {/* Roster Table (Memoized rows) */}
      <StaffTable
        staff={staff}
        isLoading={isLoading}
        searchQuery={searchQuery}
        pagination={
          paginationMeta
            ? {
                page: paginationMeta.page,
                totalPages: paginationMeta.totalPages,
                hasNextPage: paginationMeta.hasNextPage,
                hasPrevPage: paginationMeta.hasPrevPage,
                onPageChange: setPage,
                isLoading,
              }
            : undefined
        }
        onOpenAdd={handleOpenAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals & Dialogs (Isolated form state & conditional mounting) */}
      <CreateStaffModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
      />

      <EditStaffModal
        staff={editingStaff}
        onClose={handleCloseEdit}
      />

      <DeleteStaffDialog
        staff={deletingStaff}
        isDeleting={deleteMutation.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
export default Staff;
