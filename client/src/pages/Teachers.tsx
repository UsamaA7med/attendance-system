import { useState, useMemo, useCallback, useDeferredValue } from "react";
import { useTeachers, useDeleteTeacher } from "@/hooks/useTeachers";
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

  // TanStack Query: Live Teacher Roster
  const { data: teachers = [], isLoading } = useTeachers(undefined, {
    enabled: isAdmin,
  });

  const deleteMutation = useDeleteTeacher();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");

  // Modal Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Performance-optimized Filter Calculation
  const filteredTeachers = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        (teacher.phone && teacher.phone.includes(query)) ||
        (teacher.department && teacher.department.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? teacher.isActive
          : !teacher.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, deferredSearch, statusFilter]);

  // Aggregate Metrics
  const totalCount = teachers.length;
  const activeCount = useMemo(() => teachers.filter((t) => t.isActive).length, [teachers]);
  const totalClassesAssigned = useMemo(
    () => teachers.reduce((acc, t) => acc + (t.classesCount || 0), 0),
    [teachers]
  );

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
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={totalCount - activeCount}
      />

      {/* Roster Table (Memoized rows) */}
      <TeacherTable
        teachers={filteredTeachers}
        isLoading={isLoading}
        searchQuery={searchQuery}
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
