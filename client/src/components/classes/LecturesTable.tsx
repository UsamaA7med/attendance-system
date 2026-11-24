import { Button } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/common";
import { useDeleteLecture, useLecturesPaginated } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  UserCheck,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { DeleteLectureDialog } from "./DeleteLectureDialog";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/common";

interface LecturesTableProps {
  onOpenCreateLecture: (classId?: string) => void;
  onTakeAttendance: (lecture: LectureItem) => void;
}

export const LecturesTable = React.memo(function LecturesTable({
  onOpenCreateLecture,
  onTakeAttendance,
}: LecturesTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: lecturesResponse, isLoading } = useLecturesPaginated({ page, limit });
  const lectures = lecturesResponse?.data || [];
  const paginationMeta = lecturesResponse?.pagination;

  const deleteMutation = useDeleteLecture();
  const [deletingLecture, setDeletingLecture] = useState<LectureItem | null>(null);

  const handleOpenDelete = (lecture: LectureItem) => {
    setDeletingLecture(lecture);
  };

  const handleCloseDelete = () => {
    setDeletingLecture(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLecture) return;
    try {
      await deleteMutation.mutateAsync(deletingLecture.id);
      setDeletingLecture(null);
    } catch {
      // Handled in useDeleteLecture onError toast
    }
  };

  return (
    <>
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
                isLoading,
              }
            : undefined
        }
      >
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Class & Room</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Roll Call Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={6} rows={limit} hasAvatar={false} />
            ) : lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                  <CalendarDays className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    No lectures scheduled yet
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                    Schedule a class lecture with a date and unique start time to begin taking roll call.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => onOpenCreateLecture()}
                  >
                    <Plus className="h-4 w-4" />
                    Schedule First Lecture
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => {
                const summary = lecture.attendanceSummary;
                return (
                  <TableRow
                    key={lecture.id}
                  >
                    {/* Date & Start Time */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                            {lecture.date}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                            <span>Starts at {lecture.startTime}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class & Room */}
                    <TableCell className="text-xs whitespace-nowrap">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{lecture.class.name}</span>
                      </div>
                      {lecture.class.room && (
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          Room: {lecture.class.room}
                        </div>
                      )}
                    </TableCell>

                    {/* Teacher */}
                    <TableCell className="text-xs whitespace-nowrap">
                      {lecture.class.teacher ? (
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {lecture.class.teacher.name}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Roll Call Summary */}
                    <TableCell className="whitespace-nowrap">
                      {summary && summary.total > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{summary.present} Present</span>
                            </span>
                            {summary.absent > 0 && (
                              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>{summary.absent} Absent</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Total {summary.total} enrolled
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                          Pending Roll Call
                        </span>
                      )}
                    </TableCell>

                    {/* Notes */}
                    <TableCell className="text-xs text-neutral-500 max-w-[200px] truncate">
                      {lecture.notes || "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 shadow-xs"
                          onClick={() => onTakeAttendance(lecture)}
                          title="Take attendance roll call"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Roll Call</span>
                        </Button>
                        <DeleteIconButton
                          onClick={() => handleOpenDelete(lecture)}
                          disabled={deleteMutation.isPending && deletingLecture?.id === lecture.id}
                          title="Delete lecture"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableContainer>

      <DeleteLectureDialog
        lecture={deletingLecture}
        isOpen={Boolean(deletingLecture)}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
});
