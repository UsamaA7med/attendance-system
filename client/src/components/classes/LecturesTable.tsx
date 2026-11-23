import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteLecture, useLectures } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { DeleteLectureDialog } from "./DeleteLectureDialog";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";

interface LecturesTableProps {
  onOpenCreateLecture: (classId?: string) => void;
  onTakeAttendance: (lecture: LectureItem) => void;
}

export const LecturesTable = React.memo(function LecturesTable({
  onOpenCreateLecture,
  onTakeAttendance,
}: LecturesTableProps) {
  const { data: lectures = [], isLoading } = useLectures();
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
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
          <span>Scheduled Lectures ({lectures.length})</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 shadow-xs"
            onClick={() => onOpenCreateLecture()}
          >
            <Plus className="h-3.5 w-3.5" />
            New Lecture
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-semibold border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Class & Room</th>
                <th className="px-6 py-3.5">Teacher</th>
                <th className="px-6 py-3.5">Roll Call Status</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <TableSkeletonRows columns={6} rows={5} hasAvatar={false} />
              ) : lectures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
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
                  </td>
                </tr>
              ) : (
                lectures.map((lecture) => {
                  const summary = lecture.attendanceSummary;
                  return (
                    <tr
                      key={lecture.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      {/* Date & Start Time */}
                      <td className="px-6 py-4">
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
                      </td>

                      {/* Class & Room */}
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{lecture.class.name}</span>
                        </div>
                        {lecture.class.room && (
                          <div className="text-neutral-500 text-[11px] mt-0.5">
                            Room: {lecture.class.room}
                          </div>
                        )}
                      </td>

                      {/* Assigned Teacher */}
                      <td className="px-6 py-4 text-xs text-neutral-700 dark:text-neutral-300">
                        {lecture.class.teacher?.name || "Instructor"}
                      </td>

                      {/* Attendance Summary */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            {summary.present} Present
                          </span>
                          {summary.absent > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-300">
                              <XCircle className="h-3 w-3" />
                              {summary.absent} Absent
                            </span>
                          )}
                          {summary.late > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-300">
                              <Clock className="h-3 w-3" />
                              {summary.late} Late
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-400">
                            ({summary.total} enrolled)
                          </span>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-4 text-xs text-neutral-500 max-w-xs truncate">
                        {lecture.notes || <span className="italic text-neutral-400">None</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-rose-600"
                            onClick={() => handleOpenDelete(lecture)}
                            disabled={deleteMutation.isPending && deletingLecture?.id === lecture.id}
                            title="Delete lecture"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <DeleteLectureDialog
        lecture={deletingLecture}
        isOpen={Boolean(deletingLecture)}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </Card>
  );
});
