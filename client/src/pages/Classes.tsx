import { useState, useMemo, useCallback, useDeferredValue } from "react";
import { useClasses, useClassesPaginated, useDeleteClass } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import type { ClassItem } from "@/lib/classes.api";
import type { LectureItem } from "@/lib/lectures.api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ClassMetrics,
  ClassFilters,
  ClassTable,
  CreateClassModal,
  EditClassModal,
  DeleteClassDialog,
  CreateLectureModal,
  LecturesTable,
  TakeAttendanceModal,
  type StatusFilterOption,
} from "@/components/classes";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, CalendarDays } from "lucide-react";

export function Classes() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Tab state: "classes" | "lectures"
  const [activeTab, setActiveTab] = useState<"classes" | "lectures">("classes");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
      search: deferredSearch.trim() || undefined,
      teacherId: teacherFilter !== "all" ? teacherFilter : undefined,
      isActive:
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      page,
      limit,
    };
  }, [deferredSearch, statusFilter, teacherFilter, page, limit]);

  // Paginated query for classes table
  const { data: classesResponse, isLoading } = useClassesPaginated(queryParams, {
    enabled: isAdmin,
  });
  const classes = classesResponse?.data || [];
  const paginationMeta = classesResponse?.pagination;

  // Unpaginated query for aggregate metrics across all pages
  const { data: allClasses = [] } = useClasses(undefined, {
    enabled: isAdmin,
  });

  const { data: teachers = [] } = useTeachers(undefined, { enabled: isAdmin });

  const deleteMutation = useDeleteClass();

  // Class Modal States
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

  // Lecture Modal States
  const [isCreateLectureModalOpen, setIsCreateLectureModalOpen] = useState(false);
  const [lectureTargetClassId, setLectureTargetClassId] = useState<string | null>(null);
  const [attendanceLectureId, setAttendanceLectureId] = useState<string | null>(null);

  // Aggregate Metrics
  const totalClasses = allClasses.length;
  const activeClasses = useMemo(
    () => allClasses.filter((c) => c.isActive).length,
    [allClasses]
  );
  const totalLectures = useMemo(
    () => allClasses.reduce((acc, c) => acc + (c.lecturesCount || 0), 0),
    [allClasses]
  );
  const totalEnrollments = useMemo(
    () => allClasses.reduce((acc, c) => acc + (c.enrollmentsCount || 0), 0),
    [allClasses]
  );

  // Callbacks
  const handleOpenAddClass = useCallback(() => setIsAddClassModalOpen(true), []);
  const handleCloseAddClass = useCallback(
    () => setIsAddClassModalOpen(false),
    []
  );

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

  const handleOpenCreateLecture = useCallback((cls?: ClassItem | string) => {
    if (typeof cls === "string") {
      setLectureTargetClassId(cls);
    } else if (cls) {
      setLectureTargetClassId(cls.id);
    } else {
      setLectureTargetClassId(null);
    }
    setIsCreateLectureModalOpen(true);
  }, []);

  const handleCloseCreateLecture = useCallback(() => {
    setLectureTargetClassId(null);
    setIsCreateLectureModalOpen(false);
  }, []);

  const handleOpenAttendance = useCallback((lecture: LectureItem) => {
    setAttendanceLectureId(lecture.id);
  }, []);

  const handleCloseAttendance = useCallback(() => {
    setAttendanceLectureId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Classes & Lectures
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Administer center classes, scheduled lectures by date & start time, and roll call attendance.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCreateLecture()}
            disabled={classes.length === 0}
            className="gap-1.5"
          >
            <CalendarDays className="h-4 w-4" />
            <span>New Lecture</span>
          </Button>

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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("classes")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "classes"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Classes ({classes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lectures")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "lectures"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Lectures & Attendance</span>
        </button>
      </div>

      {/* Tab 1: Classes Roster */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <ClassFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            teacherFilter={teacherFilter}
            onTeacherChange={handleTeacherChange}
            teachers={teachers}
          />

          <ClassTable
            classes={classes}
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
            onOpenAdd={handleOpenAddClass}
            onEdit={handleEditClass}
            onDelete={handleDeleteClass}
            onAddLecture={handleOpenCreateLecture}
          />
        </div>
      )}

      {/* Tab 2: Lectures & Roll Call Table */}
      {activeTab === "lectures" && (
        <LecturesTable
          onOpenCreateLecture={handleOpenCreateLecture}
          onTakeAttendance={handleOpenAttendance}
        />
      )}

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

      <CreateLectureModal
        isOpen={isCreateLectureModalOpen}
        onClose={handleCloseCreateLecture}
        classes={classes}
        preselectedClassId={lectureTargetClassId}
      />

      <TakeAttendanceModal
        lectureId={attendanceLectureId}
        isOpen={Boolean(attendanceLectureId)}
        onClose={handleCloseAttendance}
      />
    </div>
  );
}

export default Classes;
