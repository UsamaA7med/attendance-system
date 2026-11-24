import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLectureAttendance,
  useUpdateLectureAttendance,
} from "@/hooks/useLectures";
import type { AttendanceStatusType } from "@/lib/lectures.api";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface TakeAttendanceModalProps {
  lectureId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface LocalRecordState {
  studentId: string;
  status: AttendanceStatusType;
  note: string;
}

export const TakeAttendanceModal = React.memo(function TakeAttendanceModal({
  lectureId,
  isOpen,
  onClose,
}: TakeAttendanceModalProps) {
  const { data, isLoading } = useLectureAttendance(lectureId || "", {
    enabled: isOpen && Boolean(lectureId),
  });

  const updateMutation = useUpdateLectureAttendance();

  const [records, setRecords] = useState<Record<string, LocalRecordState>>({});

  // Sync initial student statuses from fetched data
  useEffect(() => {
    if (data?.students) {
      const initial: Record<string, LocalRecordState> = {};
      data.students.forEach((s) => {
        initial[s.studentId] = {
          studentId: s.studentId,
          status: s.status,
          note: s.note || "",
        };
      });
      setRecords(initial);
    }
  }, [data]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updateMutation.isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, updateMutation.isPending, onClose]);

  if (!isOpen || !lectureId) return null;

  const handleStatusChange = (studentId: string, status: AttendanceStatusType) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status,
        note: prev[studentId]?.note || "",
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatusType) => {
    if (!data?.students) return;
    setRecords((prev) => {
      const next = { ...prev };
      data.students.forEach((s) => {
        next[s.studentId] = {
          studentId: s.studentId,
          status,
          note: prev[s.studentId]?.note || "",
        };
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!lectureId) return;
    const payload = Object.values(records).map((r) => ({
      studentId: r.studentId,
      status: r.status,
      note: r.note.trim() || null,
    }));

    try {
      await updateMutation.mutateAsync({
        lectureId,
        data: { records: payload },
      });
      onClose();
    } catch {
      // Handled in mutation onError
    }
  };

  const lecture = data?.lecture;
  const students = data?.students || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updateMutation.isPending) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <span>Take Attendance</span>
                {lecture && (
                  <Badge variant="outline" className="text-xs">
                    {lecture.date} at {lecture.startTime}
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-neutral-500">
                {lecture
                  ? `Roll call for "${lecture.class.name}" (${students.length} students)`
                  : "Loading lecture details..."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Bulk Actions */}
        <div className="px-6 py-2.5 bg-neutral-50/70 dark:bg-neutral-900/40 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            Bulk Actions:
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              onClick={() => handleMarkAll("PRESENT")}
            >
              <CheckCircle2 className="h-3 w-3" />
              All Present
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              onClick={() => handleMarkAll("ABSENT")}
            >
              <XCircle className="h-3 w-3" />
              All Absent
            </Button>
          </div>
        </div>

        {/* Students Roll Call List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800/80 dark:bg-neutral-900/30"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-24 opacity-70" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-7 w-16 rounded-md" />
                    <Skeleton className="h-7 w-16 rounded-md" />
                    <Skeleton className="h-7 w-14 rounded-md" />
                    <Skeleton className="h-7 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs italic">
              No students are actively enrolled in this class.
            </div>
          ) : (
            students.map((student) => {
              const currentStatus =
                records[student.studentId]?.status || student.status;

              return (
                <div
                  key={student.studentId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800/80 dark:bg-neutral-900/30"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {student.fullName}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Parent Phone: {student.parentPhone}
                    </p>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, "PRESENT")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === "PRESENT"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Present
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, "ABSENT")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === "ABSENT"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Absent
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, "LATE")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === "LATE"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Late
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, "EXCUSED")}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === "EXCUSED"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Excused
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending || students.length === 0}
            className="gap-1.5"
          >
            {updateMutation.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
});
