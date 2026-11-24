import { useState, useMemo, useCallback } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useLecturesPaginated } from "@/hooks/useLectures";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/useAuthStore";
import type { LectureItem } from "@/lib/lectures.api";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Layers,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LecturesTable,
  CreateLectureModal,
  EditLectureModal,
} from "@/components/classes";
import { DataTableFilterBar, FilterSelect } from "@/components/common";

export function Lectures() {
  const { user } = useAuthStore();
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const getTodayString = () => new Date().toLocaleDateString("en-CA");

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LectureItem | null>(null);

  // Classes for filter dropdown & creation modal
  const { data: classes = [] } = useClasses();

  // Query lectures to compute metrics & summary
  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      classId: selectedClassId !== "all" ? selectedClassId : undefined,
      date: selectedDate || undefined,
      page,
    };
  }, [debouncedSearch, selectedClassId, selectedDate, page]);

  const { data: lecturesResponse } = useLecturesPaginated(queryParams);
  const paginationMeta = lecturesResponse?.pagination;
  const currentItems = lecturesResponse?.data || [];

  // Metrics computation
  const totalLecturesCount = paginationMeta?.total ?? currentItems.length;
  const todayDateString = getTodayString();
  const todayLecturesCount = currentItems.filter((l) => l.date === todayDateString).length;

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setPage(1);
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setPage(1);
  }, []);

  const handleOpenEdit = useCallback((lecture: LectureItem) => {
    setEditingLecture(lecture);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingLecture(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
            <span>{isTeacher ? "My Lectures" : "Lectures"}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              {totalLecturesCount} Total
            </span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isTeacher
              ? "Schedule, edit, and manage lecture sessions for your assigned classes."
              : "Schedule, edit, and manage center lecture sessions across all classes."}
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={classes.length === 0}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Lecture</span>
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Total Lectures
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-1">
                  {totalLecturesCount}
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Scheduled sessions
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Today's Filter
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-1">
                  {selectedDate === todayDateString ? "Active" : "All Dates"}
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {todayDateString}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Today's Sessions
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  {todayLecturesCount}
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Lectures today
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Active Classes
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 mt-1">
                  {classes.length}
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Course offerings
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Filter Bar */}
      <DataTableFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search class or teacher..."
        searchMaxWidth="max-w-xs"
        leftContent={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-neutral-100/70 dark:bg-neutral-800/60 p-1 rounded-lg">
              <Button
                type="button"
                variant={selectedDate === todayDateString ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleDateChange(todayDateString)}
              >
                Today
              </Button>
              <Button
                type="button"
                variant={selectedDate === "" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleDateChange("")}
              >
                All Dates
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                aria-label="Filter by lecture date"
                className="h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 cursor-pointer"
              />
            </div>
          </div>
        }
      >
        <FilterSelect
          icon={<BookOpen className="h-3.5 w-3.5" />}
          value={selectedClassId}
          onChange={handleClassChange}
          options={[
            { value: "all", label: "All Classes" },
            ...classes.map((c) => ({
              value: c.id,
              label: `${c.name}${c.room ? ` (${c.room})` : ""}`,
            })),
          ]}
          ariaLabel="Filter by class"
        />
      </DataTableFilterBar>

      {/* Lectures Table with CRUD Actions (Edit, Delete) */}
      <LecturesTable
        onOpenCreateLecture={() => setIsCreateModalOpen(true)}
        onEditLecture={handleOpenEdit}
        classId={selectedClassId}
        date={selectedDate}
        search={debouncedSearch}
        page={page}
        onPageChange={setPage}
      />

      {/* Modals */}
      <CreateLectureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        classes={classes}
      />

      <EditLectureModal
        lecture={editingLecture}
        isOpen={Boolean(editingLecture)}
        onClose={handleCloseEdit}
      />
    </div>
  );
}

export default Lectures;
