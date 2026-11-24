import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateLecture } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, CalendarDays, Clock, FileText, X } from "lucide-react";
import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editLectureFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be formatted as HH:mm (e.g. 14:00)"),
  notes: z.string().trim().optional(),
});

type EditLectureFormData = z.infer<typeof editLectureFormSchema>;

interface EditLectureModalProps {
  lecture: LectureItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditLectureModal({ lecture, isOpen, onClose }: EditLectureModalProps) {
  const updateMutation = useUpdateLecture();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditLectureFormData>({
    resolver: zodResolver(editLectureFormSchema),
    defaultValues: {
      date: "",
      startTime: "",
      notes: "",
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (lecture && isOpen) {
      reset({
        date: lecture.date,
        startTime: lecture.startTime,
        notes: lecture.notes || "",
      });
    }
  }, [lecture, isOpen, reset]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !lecture) return null;

  const onSubmit = async (data: EditLectureFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: lecture.id,
        data: {
          date: data.date,
          startTime: data.startTime,
          notes: data.notes?.trim() || null,
        },
      });
      handleClose();
    } catch {
      // Error notification handled by useUpdateLecture onError
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
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Edit Lecture
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Update date, time slot, or session notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Class Info Box (Read-only) */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {lecture.class.name}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {lecture.class.room ? `Room: ${lecture.class.room}` : "No room assigned"}
                {lecture.class.teacher ? ` • Teacher: ${lecture.class.teacher.name}` : ""}
              </p>
            </div>
          </div>

          {/* Date & Start Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="lecture-edit-date"
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
              >
                <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
                Lecture Date <span className="text-rose-500">*</span>
              </label>
              <Input
                id="lecture-edit-date"
                type="date"
                {...register("date")}
                className="h-9 text-xs"
              />
              {errors.date && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lecture-edit-time"
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                Start Time <span className="text-rose-500">*</span>
              </label>
              <Input
                id="lecture-edit-time"
                type="time"
                {...register("startTime")}
                className="h-9 text-xs"
              />
              {errors.startTime && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {errors.startTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Lecture Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="lecture-edit-notes"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-neutral-400" />
              Notes (Optional)
            </label>
            <textarea
              id="lecture-edit-notes"
              rows={3}
              placeholder="e.g. Midterm revision session, Chapter 4 problem set..."
              {...register("notes")}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none transition-colors"
            />
            {errors.notes && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || updateMutation.isPending}
              className="text-xs min-w-[100px]"
            >
              {isSubmitting || updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
