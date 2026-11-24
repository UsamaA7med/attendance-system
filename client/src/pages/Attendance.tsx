import { useState, useMemo, useCallback } from "react";
import { useClasses } from "@/hooks/useClasses";
import { useLectures, useLecturesPaginated } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  UserCheck,
  XCircle,
  Filter,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { TakeAttendanceModal } from "@/components/classes/TakeAttendanceModal";
import { CreateLectureModal } from "@/components/classes/CreateLectureModal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/common";

export function Attendance() {
  const getTodayString = () => new Date().toLocaleDateString("en-CA");

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setPage(1);
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Modals state
  const [attendanceLectureId, setAttendanceLectureId] = useState<string | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isCreateLectureOpen, setIsCreateLectureOpen] = useState(false);

  // Data fetching
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses();

  const queryParams = useMemo(() => {
    return {
      date: selectedDate || undefined,
      classId: selectedClassId !== "all" ? selectedClassId : undefined,
      search: searchQuery.trim() || undefined,
      page,
      limit,
    };
  }, [selectedDate, selectedClassId, searchQuery, page, limit]);

  const { data: lecturesResponse, isLoading: isLoadingLectures } = useLecturesPaginated(queryParams);
  const lectures = lecturesResponse?.data || [];
  const paginationMeta = lecturesResponse?.pagination;

  // Aggregate unpaginated query for current filter to compute accurate day metrics
  const { data: allFilteredLectures = [] } = useLectures({
    date: selectedDate || undefined,
    classId: selectedClassId !== "all" ? selectedClassId : undefined,
    search: searchQuery.trim() || undefined,
  });

  // Aggregate Metrics for the active filter
  const metrics = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;
    let totalStudents = 0;

    allFilteredLectures.forEach((l) => {
      const summary = l.attendanceSummary;
      if (summary) {
        totalPresent += summary.present;
        totalAbsent += summary.absent;
        totalLate += summary.late;
        totalExcused += summary.excused;
        totalStudents += summary.total;
      }
    });

    const totalMarked = totalPresent + totalAbsent + totalLate + totalExcused;
    const rate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    return {
      sessionCount: allFilteredLectures.length,
      totalStudents,
      totalPresent,
      totalAbsent,
      attendanceRate: rate,
    };
  }, [allFilteredLectures]);

  const handleOpenAttendance = useCallback((lecture: LectureItem) => {
    setAttendanceLectureId(lecture.id);
    setIsAttendanceModalOpen(true);
  }, []);

  const handleCloseAttendance = useCallback(() => {
    setIsAttendanceModalOpen(false);
    setAttendanceLectureId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Student Attendance
            </h1>
            <Badge variant="outline" className="text-xs">
              Staff Portal
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Conduct student roll call and track daily session attendance records.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          className="gap-1.5 shadow-xs"
          onClick={() => setIsCreateLectureOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Lecture</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Sessions
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
                {metrics.sessionCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Present Students
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.totalPresent}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Absent Students
              </p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {metrics.totalAbsent}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Attendance Rate
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
                {metrics.attendanceRate}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Date Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left Controls: Date Picker & Quick Date Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-neutral-100/70 dark:bg-neutral-800/60 p-1 rounded-lg">
                <Button
                  type="button"
                  variant={selectedDate === getTodayString() ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleDateChange(getTodayString())}
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

              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            {/* Right Controls: Class Dropdown & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.room ? `(${c.room})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[160px] sm:min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search class or teacher..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lectures / Roll Call Table */}
      <DataTableContainer
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
                isLoading: isLoadingLectures,
              }
            : undefined
        }
        swipeHint="Swipe horizontally to view all sessions"
      >
        <Table className="min-w-[750px]">
          <TableHeader>
            <TableRow>
              <TableHead>Time & Date</TableHead>
              <TableHead>Class & Location</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Roll Call Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingLectures || isLoadingClasses ? (
              <TableSkeletonRows columns={5} rows={limit} hasAvatar={false} />
            ) : lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-neutral-500">
                  <CalendarDays className="h-9 w-9 mx-auto text-neutral-400 mb-2" />
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    No lecture sessions found
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    {selectedDate === getTodayString()
                      ? "No lectures have been scheduled for today yet. You can schedule a session right now."
                      : "No lectures match your selected date and filters."}
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => setIsCreateLectureOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Lecture Session
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => {
                const summary = lecture.attendanceSummary;
                const hasAttendance = summary && summary.total > 0;

                return (
                  <TableRow
                    key={lecture.id}
                  >
                    {/* Time & Date */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                            {lecture.startTime}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {lecture.date}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class & Location */}
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 text-xs truncate">
                          {lecture.class.name}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {lecture.class.room ? `Room: ${lecture.class.room}` : "No room assigned"}
                        </p>
                      </div>
                    </TableCell>

                    {/* Instructor */}
                    <TableCell>
                      <span className="text-xs text-neutral-700 dark:text-neutral-300">
                        {lecture.class.teacher?.name || "Unassigned"}
                      </span>
                    </TableCell>

                    {/* Roll Call Status Badges */}
                    <TableCell>
                      {hasAttendance ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {summary.present} Present
                          </span>
                          {summary.absent > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                              <XCircle className="h-3 w-3" />
                              {summary.absent} Absent
                            </span>
                          )}
                          {summary.late > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              {summary.late} Late
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-400 ml-1">
                            ({summary.total} enrolled)
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          No students enrolled yet
                        </span>
                      )}
                    </TableCell>

                    {/* Action: Take Attendance */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gap-1.5 h-8 text-xs font-semibold"
                        onClick={() => handleOpenAttendance(lecture)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Take Attendance
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableContainer>

      {/* Take Attendance Modal */}
      <TakeAttendanceModal
        lectureId={attendanceLectureId}
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseAttendance}
      />

      {/* Schedule Lecture Modal */}
      <CreateLectureModal
        isOpen={isCreateLectureOpen}
        onClose={() => setIsCreateLectureOpen(false)}
        classes={classes}
        preselectedClassId={selectedClassId !== "all" ? selectedClassId : null}
      />
    </div>
  );
}

export default Attendance;
