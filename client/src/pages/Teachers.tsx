import { useState, useMemo, useCallback } from "react";
import { useTeachersPaginated, useTeacherMetrics, useDeleteTeacher } from "@/hooks/useTeachers";
import { useDebounce } from "@/hooks/useDebounce";
import type { Teacher } from "@/lib/teachers.api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  TeacherMetrics,
  TeacherFilters,
  TeacherTable,
  CreateTeacherModal,
  EditTeacherModal,
  DeleteTeacherDialog,
  type StatusFilterOption,
} from "@/components/teachers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Teachers() {
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

  // TanStack Query: Paginated Teacher Roster
  const { data: teachersResponse, isLoading } = useTeachersPaginated(queryParams, {
    enabled: isAdmin,
  });
  const teachers = teachersResponse?.data || [];
  const paginationMeta = teachersResponse?.pagination;

  // Lightweight server-side metrics
  const { data: metrics } = useTeacherMetrics({ enabled: isAdmin });

  const deleteMutation = useDeleteTeacher();

  // Modal Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Aggregate Metrics
  const totalCount = metrics?.totalCount ?? paginationMeta?.total ?? 0;
  const activeCount = metrics?.activeCount ?? 0;
  const totalClassesAssigned = metrics?.totalClassesAssigned ?? 0;

  // Stable callbacks for child components to prevent re-renders
  const handleOpenAdd = useCallback(() => setIsAddModalOpen(true), []);
  const handleCloseAdd = useCallback(() => setIsAddModalOpen(false), []);
  const handleEdit = useCallback((teacher: Teacher) => setEditingTeacher(teacher), []);
  const handleCloseEdit = useCallback(() => setEditingTeacher(null), []);
  const handleDelete = useCallback((teacher: Teacher) => setDeletingTeacher(teacher), []);
  const handleCloseDelete = useCallback(() => setDeletingTeacher(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTeacher) return;
    await deleteMutation.mutateAsync(deletingTeacher.id);
    setDeletingTeacher(null);
  }, [deletingTeacher, deleteMutation]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Teachers Management
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create, update, inspect, and manage center teaching staff and course assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Metrics Section (Memoized) */}
      <TeacherMetrics
        totalCount={totalCount}
        activeCount={activeCount}
        totalClassesAssigned={totalClassesAssigned}
      />

      {/* Search & Filter Controls (Memoized) */}
      <TeacherFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={totalCount - activeCount}
      />

      {/* Roster Table (Memoized rows) */}
      <TeacherTable
        teachers={teachers}
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
      <CreateTeacherModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
      />

      <EditTeacherModal
        teacher={editingTeacher}
        onClose={handleCloseEdit}
      />

      <DeleteTeacherDialog
        teacher={deletingTeacher}
        isDeleting={deleteMutation.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
export default Teachers;
