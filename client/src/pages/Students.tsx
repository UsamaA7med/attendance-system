import { useState, useMemo, useCallback, useDeferredValue } from "react";
import { useStudents, useStudentsPaginated, useDeleteStudent } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import type { StudentItem } from "@/lib/students.api";
import {
  StudentMetrics,
  StudentFilters,
  StudentTable,
  CreateStudentModal,
  EditStudentModal,
  DeleteStudentDialog,
  type StudentStatusOption,
} from "@/components/students";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Students() {
  // Data fetching
  const { data: classes = [] } = useClasses();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StudentStatusOption>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: StudentStatusOption) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setClassFilter(classId);
    setPage(1);
  }, []);

  const queryParams = useMemo(() => {
    return {
      search: deferredSearch.trim() || undefined,
      classId: classFilter !== "all" ? classFilter : undefined,
      isActive:
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      page,
      limit,
    };
  }, [deferredSearch, classFilter, statusFilter, page, limit]);

  const { data: studentsResponse, isLoading } = useStudentsPaginated(queryParams);
  const students = studentsResponse?.data || [];
  const paginationMeta = studentsResponse?.pagination;

  // Unpaginated students for accurate aggregate metrics
  const { data: allStudents = [] } = useStudents();
  const deleteMutation = useDeleteStudent();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);

  // Metrics
  const totalStudents = allStudents.length;
  const activeStudents = useMemo(
    () => allStudents.filter((s) => s.isActive).length,
    [allStudents]
  );
  const inactiveStudents = totalStudents - activeStudents;
  const totalEnrollments = useMemo(
    () =>
      allStudents.reduce(
        (acc, s) =>
          acc + (s.enrollments?.filter((e) => e.status === "ACTIVE").length || 0),
        0
      ),
    [allStudents]
  );

  // Callbacks
  const handleOpenAdd = useCallback(() => setIsAddModalOpen(true), []);
  const handleCloseAdd = useCallback(() => setIsAddModalOpen(false), []);

  const handleEdit = useCallback((student: StudentItem) => setEditingStudent(student), []);
  const handleCloseEdit = useCallback(() => setEditingStudent(null), []);

  const handleDelete = useCallback((student: StudentItem) => setDeletingStudent(student), []);
  const handleCloseDelete = useCallback(() => setDeletingStudent(null), []);

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    try {
      await deleteMutation.mutateAsync(deletingStudent.id);
      setDeletingStudent(null);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Students Directory
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Manage student registrations, guardian contact details, and class enrollments.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 shadow-xs"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4" />
          <span>Register Student</span>
        </Button>
      </div>

      {/* Metrics */}
      <StudentMetrics
        total={totalStudents}
        active={activeStudents}
        inactive={inactiveStudents}
        totalEnrollments={totalEnrollments}
      />

      {/* Search & Filters */}
      <StudentFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        classFilter={classFilter}
        onClassChange={handleClassChange}
        classes={classes}
      />

      {/* Table */}
  <StudentTable
        students={students}
        isLoading={isLoading}
        searchQuery={searchQuery}
        pagination={
          paginationMeta
            ? {
                page: paginationMeta.page,
                limit: paginationMeta.limit,
                total: paginationMeta.total,
                totalPages: paginationMeta.totalPages,
                hasNextPage: paginationMeta.hasNextPage,
                hasPrevPage: paginationMeta.hasPrevPage,
                onPageChange: setPage,
                onLimitChange: setLimit,
                isLoading,
              }
            : undefined
        }
        onOpenAdd={handleOpenAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      <CreateStudentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
        classes={classes}
      />

      {/* Edit Modal */}
      <EditStudentModal
        student={editingStudent}
        onClose={handleCloseEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteStudentDialog
        student={deletingStudent}
        isDeleting={deleteMutation.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default Students;
