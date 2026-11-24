import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLectureAttendance,
  useUpdateLectureAttendance,
  lectureKeys,
} from "@/hooks/useLectures";
import { useStudents, studentKeys } from "@/hooks/useStudents";
import { classKeys } from "@/hooks/useClasses";
import { studentsApi } from "@/lib/students.api";
import { useQueryClient } from "@tanstack/react-query";
import type { AttendanceStatusType } from "@/lib/lectures.api";
import type { StudentItem } from "@/lib/students.api";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  UserCheck,
  UserPlus,
  X,
  XCircle,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

interface StudentAttendanceItem {
  id: string;
  studentId: string;
  fullName: string;
  phone: string | null;
  parentPhone: string;
  status: AttendanceStatusType;
  note: string | null;
  markedAt: string | null;
  markedByName: string | null;
}

// ============================================================================
// Memoized Student Roll Call Row Component
// Prevents re-rendering all rows when only one student's status changes
// ============================================================================
interface StudentRollCallRowProps {
  studentId: string;
  fullName: string;
  parentPhone: string;
  status: AttendanceStatusType;
  onStatusChange: (studentId: string, status: AttendanceStatusType) => void;
}

const StudentRollCallRow = React.memo(function StudentRollCallRow({
  studentId,
  fullName,
  parentPhone,
  status,
  onStatusChange,
}: StudentRollCallRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800/80 dark:bg-neutral-900/30">
      <div className="min-w-0">
        <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
          {fullName}
        </p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Parent Phone: {parentPhone}
        </p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onStatusChange(studentId, "PRESENT")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
            status === "PRESENT"
              ? "bg-emerald-600 text-white shadow-xs"
              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Present
        </button>

        <button
          type="button"
          onClick={() => onStatusChange(studentId, "ABSENT")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
            status === "ABSENT"
              ? "bg-rose-600 text-white shadow-xs"
              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          Absent
        </button>

        <button
          type="button"
          onClick={() => onStatusChange(studentId, "LATE")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
            status === "LATE"
              ? "bg-amber-600 text-white shadow-xs"
              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Late
        </button>

        <button
          type="button"
          onClick={() => onStatusChange(studentId, "EXCUSED")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
            status === "EXCUSED"
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
});

// ============================================================================
// Memoized Registered Student Selector Row Component
// ============================================================================
interface RegisteredStudentPickerRowProps {
  student: StudentItem;
  isChecked: boolean;
  onToggle: (studentId: string) => void;
  onAdd: (student: StudentItem) => void;
  isPending: boolean;
}

const RegisteredStudentPickerRow = React.memo(function RegisteredStudentPickerRow({
  student,
  isChecked,
  onToggle,
  onAdd,
  isPending,
}: RegisteredStudentPickerRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
        isChecked
          ? "bg-blue-50/80 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
          : "bg-white border-neutral-200/70 hover:bg-neutral-100/60 dark:bg-neutral-950 dark:border-neutral-800 dark:hover:bg-neutral-900/60"
      }`}
    >
      <label
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
        onClick={() => onToggle(student.id)}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {}} // Handled by container click
          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400 h-3.5 w-3.5"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {student.fullName}
          </p>
          <p className="text-[10px] text-neutral-500 truncate">
            Guardian: {student.parentName} ({student.parentPhone})
          </p>
        </div>
      </label>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-6 text-[11px] gap-1 px-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800 shrink-0"
        onClick={() => onAdd(student)}
        disabled={isPending}
      >
        <Plus className="h-3 w-3" />
        Add
      </Button>
    </div>
  );
});

// ============================================================================
// Main TakeAttendanceModal Component
// ============================================================================
export const TakeAttendanceModal = React.memo(function TakeAttendanceModal({
  lectureId,
  isOpen,
  onClose,
}: TakeAttendanceModalProps) {
  // 1. Attendance query: only runs when modal is open and lectureId is valid
  const { data, isLoading } = useLectureAttendance(lectureId || "", {
    enabled: isOpen && Boolean(lectureId),
  });

  const queryClient = useQueryClient();
  const updateMutation = useUpdateLectureAttendance();
  const [isEnrolling, setIsEnrolling] = useState(false);

  // 2. Attendance records state: Map of studentId -> { studentId, status, note }
  const [records, setRecords] = useState<Record<string, LocalRecordState>>({});
  const [extraStudents, setExtraStudents] = useState<StudentAttendanceItem[]>([]);

  // 3. Inline Registered Student Selector State
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [searchRegisteredQuery, setSearchRegisteredQuery] = useState("");
  const deferredSearchRegistered = useDeferredValue(searchRegisteredQuery);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // 4. PERFORMANCE BOOST: Lazy fetch registered active students ONLY when the selector is opened
  const { data: allRegisteredStudents = [], isLoading: isLoadingAllStudents } = useStudents(
    { isActive: true },
    { enabled: isOpen && showAddSelector }
  );

  // Sync initial student statuses from fetched data (preserving any user-modified records)
  useEffect(() => {
    if (data?.students) {
      setRecords((prev) => {
        const next: Record<string, LocalRecordState> = { ...prev };
        let hasChanges = false;
        data.students.forEach((s) => {
          if (!next[s.studentId]) {
            next[s.studentId] = {
              studentId: s.studentId,
              status: s.status,
              note: s.note || "",
            };
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [data]);

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowAddSelector(false);
      setSearchRegisteredQuery("");
      setSelectedStudentIds(new Set());
      setExtraStudents([]);
      setRecords({});
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updateMutation.isPending && !isEnrolling) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, updateMutation.isPending, isEnrolling, onClose]);

  const lecture = data?.lecture;

  // Set of student IDs currently present in roll call (decoupled from records to prevent re-renders on status changes)
  const enrolledStudentIdSet = useMemo(() => {
    const set = new Set<string>();
    if (data?.students) {
      data.students.forEach((s) => set.add(s.studentId));
    }
    extraStudents.forEach((s) => set.add(s.studentId));
    return set;
  }, [data?.students, extraStudents]);

  // Unenrolled registered students eligible to be added (uses deferred search for 60fps typing)
  const unenrolledRegisteredStudents = useMemo(() => {
    if (!showAddSelector) return [];

    const query = deferredSearchRegistered.toLowerCase().trim();

    return allRegisteredStudents.filter((s) => {
      if (enrolledStudentIdSet.has(s.id)) return false;

      if (!query) return true;
      return (
        s.fullName.toLowerCase().includes(query) ||
        s.parentPhone.includes(query) ||
        (s.phone && s.phone.includes(query)) ||
        s.parentName.toLowerCase().includes(query)
      );
    });
  }, [allRegisteredStudents, enrolledStudentIdSet, deferredSearchRegistered, showAddSelector]);

  // Displayed students in roll call (base + extra added inline)
  const displayedStudents = useMemo(() => {
    const baseList: StudentAttendanceItem[] = data?.students || [];
    const combined = [...baseList, ...extraStudents];
    const seen = new Set<string>();
    return combined.filter((s) => {
      if (seen.has(s.studentId)) return false;
      seen.add(s.studentId);
      return true;
    });
  }, [data?.students, extraStudents]);

  // Highly optimized stable status change callback (zero re-render of unrelated rows)
  const handleStatusChange = useCallback(
    (studentId: string, status: AttendanceStatusType) => {
      setRecords((prev) => {
        if (prev[studentId]?.status === status) return prev;
        return {
          ...prev,
          [studentId]: {
            studentId,
            status,
            note: prev[studentId]?.note || "",
          },
        };
      });
    },
    []
  );

  const handleMarkAll = useCallback(
    (status: AttendanceStatusType) => {
      if (displayedStudents.length === 0) return;
      setRecords((prev) => {
        // Performance guard: do not re-render if all students already have target status
        const isAlreadyAll = displayedStudents.every(
          (s) => (prev[s.studentId]?.status || s.status) === status
        );
        if (isAlreadyAll) return prev;

        const next: Record<string, LocalRecordState> = {};
        displayedStudents.forEach((s) => {
          next[s.studentId] = {
            studentId: s.studentId,
            status,
            note: prev[s.studentId]?.note || "",
          };
        });
        return next;
      });
    },
    [displayedStudents]
  );

  // Add one or more chosen registered students to roll call and enroll them in class
  const handleAddStudentsToRollCall = useCallback(
    async (studentsToAdd: StudentItem[]) => {
      if (!lecture || studentsToAdd.length === 0) return;

      // 1. Instantly append to local records as PRESENT
      const newExtraItems: StudentAttendanceItem[] = [];

      setRecords((prev) => {
        const next = { ...prev };
        studentsToAdd.forEach((student) => {
          next[student.id] = {
            studentId: student.id,
            status: "PRESENT",
            note: "",
          };
          newExtraItems.push({
            id: `virtual-${student.id}`,
            studentId: student.id,
            fullName: student.fullName,
            phone: student.phone,
            parentPhone: student.parentPhone,
            status: "PRESENT",
            note: null,
            markedAt: null,
            markedByName: null,
          });
        });
        return next;
      });

      setExtraStudents((prev) => [...prev, ...newExtraItems]);

      // 2. Reset selection state
      setSelectedStudentIds(new Set());
      setShowAddSelector(false);
      setSearchRegisteredQuery("");

      // 3. Persist enrollment in class (direct API call to prevent multiple toasts and multiple query invalidations)
      try {
        setIsEnrolling(true);
        await Promise.all(
          studentsToAdd.map((student) =>
            studentsApi.enroll({
              studentId: student.id,
              classId: lecture.classId,
            })
          )
        );

        // Batch invalidate queries once
        queryClient.invalidateQueries({
          queryKey: lectureKeys.attendance(lecture.id),
        });
        queryClient.invalidateQueries({ queryKey: lectureKeys.all });
        queryClient.invalidateQueries({ queryKey: classKeys.all });
        queryClient.invalidateQueries({ queryKey: studentKeys.all });

        // Exactly ONE single toast for the entire operation
        toast.dismiss();
        toast.success(
          studentsToAdd.length === 1
            ? `Added "${studentsToAdd[0].fullName}" to roll call`
            : `Added ${studentsToAdd.length} students to roll call`,
          {
            description: `Enrolled in "${lecture.class.name}".`,
          }
        );
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to enroll student(s)";
        toast.dismiss();
        toast.error("Failed to add students to roll call", { description: message });
      } finally {
        setIsEnrolling(false);
      }
    },
    [lecture, queryClient]
  );

  const handleToggleStudentSelection = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    setSelectedStudentIds((prev) => {
      if (prev.size === unenrolledRegisteredStudents.length) {
        return new Set();
      }
      return new Set(unenrolledRegisteredStudents.map((s) => s.id));
    });
  }, [unenrolledRegisteredStudents]);

  const handleAddSelected = useCallback(() => {
    const selected = unenrolledRegisteredStudents.filter((s) =>
      selectedStudentIds.has(s.id)
    );
    handleAddStudentsToRollCall(selected);
  }, [unenrolledRegisteredStudents, selectedStudentIds, handleAddStudentsToRollCall]);

  const handleAddSingle = useCallback(
    (student: StudentItem) => {
      handleAddStudentsToRollCall([student]);
    },
    [handleAddStudentsToRollCall]
  );

  // Memoized live summary counters for visual roll call progress
  const summaryCounts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    displayedStudents.forEach((s) => {
      const st = records[s.studentId]?.status || s.status;
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "LATE") late++;
      else if (st === "EXCUSED") excused++;
    });

    return {
      present,
      absent,
      late,
      excused,
      total: displayedStudents.length,
    };
  }, [displayedStudents, records]);

  const handleSave = useCallback(async () => {
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
  }, [lectureId, records, updateMutation, onClose]);

  if (!isOpen || !lectureId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          !updateMutation.isPending &&
          !isEnrolling
        ) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
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
                  ? `Roll call for "${lecture.class.name}" (${displayedStudents.length} students)`
                  : "Loading lecture details..."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending || isEnrolling}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Bar: Bulk Actions, Live Tally & Inline Picker Toggle */}
        <div className="px-6 py-2.5 bg-neutral-50/70 dark:bg-neutral-900/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                Bulk:
              </span>
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

            {displayedStudents.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium pl-2 border-l border-neutral-200 dark:border-neutral-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {summaryCounts.present} Present
                </span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {summaryCounts.absent} Absent
                </span>
                {summaryCounts.late > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {summaryCounts.late} Late
                    </span>
                  </>
                )}
                {summaryCounts.excused > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {summaryCounts.excused} Excused
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant={showAddSelector ? "default" : "outline"}
            size="sm"
            className="h-7 text-[11px] gap-1"
            onClick={() => setShowAddSelector((prev) => !prev)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Choose Registered Student</span>
            {showAddSelector ? (
              <ChevronUp className="h-3 w-3 ml-0.5" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Inline Registered Student Selector Panel (NO separate modal) */}
        {showAddSelector && (
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Select Registered Students
                </p>
                <p className="text-[11px] text-neutral-500">
                  Pick one or more students to attend this session and join this class roster.
                </p>
              </div>

              {unenrolledRegisteredStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-semibold underline underline-offset-2 shrink-0"
                >
                  {selectedStudentIds.size === unenrolledRegisteredStudents.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search registered students by name or parent phone..."
                value={searchRegisteredQuery}
                onChange={(e) => setSearchRegisteredQuery(e.target.value)}
                className="pl-9 h-8 text-xs bg-white dark:bg-neutral-950"
              />
            </div>

            {/* Students List */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {isLoadingAllStudents ? (
                <div className="py-4 text-center text-xs text-neutral-400 italic">
                  Loading registered students...
                </div>
              ) : unenrolledRegisteredStudents.length === 0 ? (
                <div className="py-4 text-center text-xs text-neutral-400 italic">
                  {deferredSearchRegistered
                    ? "No matching registered students found."
                    : "All registered students are already in this roll call."}
                </div>
              ) : (
                unenrolledRegisteredStudents.map((student) => (
                  <RegisteredStudentPickerRow
                    key={student.id}
                    student={student}
                    isChecked={selectedStudentIds.has(student.id)}
                    onToggle={handleToggleStudentSelection}
                    onAdd={handleAddSingle}
                    isPending={isEnrolling}
                  />
                ))
              )}
            </div>

            {/* Batch Selection Action */}
            {selectedStudentIds.size > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  {selectedStudentIds.size} student
                  {selectedStudentIds.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleAddSelected}
                  disabled={isEnrolling}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {isEnrolling
                    ? "Adding..."
                    : `Add Selected (${selectedStudentIds.size}) to Roll Call`}
                </Button>
              </div>
            )}
          </div>
        )}

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
          ) : displayedStudents.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              <p className="italic">No students are actively enrolled in this class.</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 gap-1.5"
                onClick={() => setShowAddSelector(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Choose from Registered Students
              </Button>
            </div>
          ) : (
            displayedStudents.map((student) => {
              const currentStatus =
                records[student.studentId]?.status || student.status;

              return (
                <StudentRollCallRow
                  key={student.studentId}
                  studentId={student.studentId}
                  fullName={student.fullName}
                  parentPhone={student.parentPhone}
                  status={currentStatus}
                  onStatusChange={handleStatusChange}
                />
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
            disabled={updateMutation.isPending || isEnrolling}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={
              updateMutation.isPending ||
              isEnrolling ||
              displayedStudents.length === 0
            }
            className="gap-1.5"
          >
            {updateMutation.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default TakeAttendanceModal;
