import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateLecture } from "@/hooks/useLectures";
import type { ClassItem } from "@/lib/classes.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, RefreshCw, Users, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createLectureFormSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be formatted as HH:mm (e.g. 14:00)"),
  notes: z.string().trim().optional(),
});

type CreateLectureFormData = z.infer<typeof createLectureFormSchema>;

interface CreateLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  preselectedClassId?: string | null;
}

export function CreateLectureModal({
  isOpen,
  onClose,
  classes,
  preselectedClassId,
}: CreateLectureModalProps) {
  const createMutation = useCreateLecture();

  const getLocalDateString = () => new Date().toLocaleDateString("en-CA");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLectureFormData>({
    resolver: zodResolver(createLectureFormSchema),
    defaultValues: {
      classId: preselectedClassId || (classes[0]?.id ?? ""),
      date: getLocalDateString(),
      startTime: "16:00",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  // Synchronize class selection and date when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetClassId =
        preselectedClassId ||
        (classes.length > 0 ? classes[0].id : "");

      reset({
        classId: targetClassId,
        date: getLocalDateString(),
        startTime: "16:00",
        notes: "",
      });
    }
  }, [isOpen, preselectedClassId, classes, reset]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedClassId = watch("classId");
  const currentClass = classes.find((c) => c.id === selectedClassId);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateLectureFormData) => {
    try {
      await createMutation.mutateAsync({
        classId: data.classId,
        date: data.date,
        startTime: data.startTime,
        notes: data.notes?.trim() || null,
      });
      handleClose();
    } catch {
      // Error notifications handled by useCreateLecture
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Schedule Class Lecture
              </h3>
              <p className="text-xs text-neutral-500">
                Create a dated lecture slot with unique start time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Select Class <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("classId")}
              className="mt-1 w-full h-9 px-3 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
            >
              <option value="">Select Class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.room ? `(${c.room})` : ""} - {c.teacher?.name}
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="mt-1 text-xs text-rose-500">{errors.classId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Lecture Date <span className="text-rose-500">*</span>
              </label>
              <Input type="date" {...register("date")} className="mt-1 text-xs" />
              {errors.date && (
                <p className="mt-1 text-xs text-rose-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                <Input
                  type="time"
                  {...register("startTime")}
                  className="pl-8 text-xs h-9"
                />
              </div>
              {errors.startTime && (
                <p className="mt-1 text-xs text-rose-500">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          {currentClass && (
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/50 p-3 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
              <span>
                <strong>{currentClass.enrollmentsCount}</strong> active students enrolled
                will be initialized for attendance.
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Lecture Agenda / Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="e.g. Chapter 4 Quiz, midterm revision, homework discussion..."
              className="mt-1 w-full p-2.5 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || classes.length === 0}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Create Lecture"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
