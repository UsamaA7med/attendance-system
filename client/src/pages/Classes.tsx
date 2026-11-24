import { useState, useMemo, useCallback } from "react";
import { useClassesPaginated, useClassMetrics, useDeleteClass } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { useDebounce } from "@/hooks/useDebounce";
import type { ClassItem } from "@/lib/classes.api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ClassMetrics,
  ClassFilters,
  ClassTable,
  CreateClassModal,
  EditClassModal,
  DeleteClassDialog,
  type StatusFilterOption,
} from "@/components/classes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Classes() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const canAccessClasses = isAdmin || isTeacher;

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: StatusFilterOption) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleTeacherChange = useCallback((teacherId: string) => {
    setTeacherFilter(teacherId);
    setPage(1);
  }, []);

  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      teacherId: teacherFilter !== "all" ? teacherFilter : undefined,
      isActive:
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      page,
    };
  }, [debouncedSearch, statusFilter, teacherFilter, page]);

  // Paginated query for classes table
  const { data: classesResponse, isLoading } = useClassesPaginated(queryParams, {
    enabled: canAccessClasses,
  });
  const classes = classesResponse?.data || [];
  const paginationMeta = classesResponse?.pagination;

  // Lightweight server-side metrics
  const { data: metrics } = useClassMetrics({
    enabled: canAccessClasses,
  });

  const { data: teachers = [] } = useTeachers(undefined, { enabled: isAdmin });

  const deleteMutation = useDeleteClass();

  // Class Modal States
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

  // Aggregate Metrics
  const totalClasses = metrics?.totalClasses ?? paginationMeta?.total ?? 0;
  const activeClasses = metrics?.activeClasses ?? 0;
  const totalLectures = metrics?.totalLectures ?? 0;
  const totalEnrollments = metrics?.totalEnrollments ?? 0;

  // Callbacks
  const handleOpenAddClass = useCallback(() => setIsAddClassModalOpen(true), []);
  const handleCloseAddClass = useCallback(() => setIsAddClassModalOpen(false), []);

  const handleEditClass = useCallback((cls: ClassItem) => setEditingClass(cls), []);
  const handleCloseEditClass = useCallback(() => setEditingClass(null), []);

  const handleDeleteClass = useCallback((cls: ClassItem) => {
    setDeletingClass(cls);
  }, []);
  const handleCloseDeleteClass = useCallback(() => setDeletingClass(null), []);

  const handleConfirmDeleteClass = useCallback(async () => {
    if (!deletingClass) return;
    try {
      await deleteMutation.mutateAsync(deletingClass.id);
      setDeletingClass(null);
    } catch {
      // Handled in mutation onError toast
    }
  }, [deletingClass, deleteMutation]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {isTeacher ? "My Classes" : "Classes"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isTeacher
              ? "Manage your assigned classes and enrolled students."
              : "Administer center classes, descriptions, and teacher assignments."}
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleOpenAddClass} className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>New Class</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics Banner */}
      <ClassMetrics
        totalClasses={totalClasses}
        activeClasses={activeClasses}
        totalLectures={totalLectures}
        totalEnrollments={totalEnrollments}
      />

      {/* Classes Roster */}
      <div className="space-y-4">
        <ClassFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          teacherFilter={teacherFilter}
          onTeacherChange={handleTeacherChange}
          teachers={teachers}
          showTeacherFilter={!isTeacher}
        />

        <ClassTable
          classes={classes}
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
          onOpenAdd={handleOpenAddClass}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
        />
      </div>

      {/* Modals & Dialogs */}
      <CreateClassModal
        isOpen={isAddClassModalOpen}
        onClose={handleCloseAddClass}
        teachers={teachers}
      />

      <EditClassModal
        cls={editingClass}
        onClose={handleCloseEditClass}
        teachers={teachers}
      />

      <DeleteClassDialog
        cls={deletingClass}
        isOpen={Boolean(deletingClass)}
        onClose={handleCloseDeleteClass}
        onConfirm={handleConfirmDeleteClass}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default Classes;
