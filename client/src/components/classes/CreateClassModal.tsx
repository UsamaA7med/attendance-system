import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateClass } from "@/hooks/useClasses";
import type { Teacher } from "@/lib/teachers.api";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, BookOpen, X } from "lucide-react";
import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createClassFormSchema = z.object({
  name: z.string().trim().min(2, "Class name must be at least 2 characters"),
  room: z.string().trim().optional(),
  description: z.string().trim().optional(),
  teacherId: z.string().min(1, "Please select an assigned teacher"),
  isActive: z.boolean().optional(),
});

type CreateClassFormData = z.infer<typeof createClassFormSchema>;

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
}

export function CreateClassModal({ isOpen, onClose, teachers }: CreateClassModalProps) {
  const { user } = useAuthStore();
  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const createMutation = useCreateClass();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassFormSchema),
    defaultValues: {
      name: "",
      room: "",
      description: "",
      teacherId: isTeacher && user ? user.id : "",
      isActive: true,
    },
  });

  const handleClose = useCallback(() => {
    reset({
      name: "",
      room: "",
      description: "",
      teacherId: isTeacher && user ? user.id : "",
      isActive: true,
    });
    onClose();
  }, [reset, onClose, isTeacher, user]);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        room: "",
        description: "",
        teacherId: isTeacher && user ? user.id : "",
        isActive: true,
      });
    }
  }, [isOpen, reset, isTeacher, user]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        room: data.room?.trim() || null,
        description: data.description?.trim() || null,
        teacherId: isTeacher && user ? user.id : data.teacherId,
        isActive: data.isActive,
      });
      handleClose();
    } catch {
      // Error notification handled by mutation onError
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
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Create New Class
              </h3>
              <p className="text-xs text-neutral-500">
                Configure course group, room, and assign an instructor.
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
              Class Name <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Mathematics - Grade 10"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Assigned Teacher <span className="text-rose-500">*</span>
              </label>
              {isTeacher ? (
                <div className="mt-1 flex h-9 items-center px-3 text-xs rounded-md border border-neutral-200 bg-neutral-100 text-neutral-800 font-medium dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                  {user?.name || "You"} (You)
                </div>
              ) : (
                <>
                  <select
                    {...register("teacherId")}
                    className="mt-1 w-full h-9 px-3 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  >
                    <option value="">Select Teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department || "Instructor"})
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && (
                    <p className="mt-1 text-xs text-rose-500">{errors.teacherId.message}</p>
                  )}
                  {teachers.length === 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>No teachers available. Please add a teacher first.</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Room / Laboratory
              </label>
              <Input
                {...register("room")}
                placeholder="e.g. Room 101 or Lab A"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description / Notes
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Optional course syllabus summary or student level description..."
              className="mt-1 w-full p-2.5 text-xs rounded-md border border-neutral-200 bg-white text-neutral-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="create-class-active"
              {...register("isActive")}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950"
            />
            <label
              htmlFor="create-class-active"
              className="text-xs text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer"
            >
              Class is active and open for enrollment
            </label>
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
              disabled={isSubmitting || teachers.length === 0}
              className="gap-1.5"
            >
              {isSubmitting ? "Creating Class..." : "Create Class"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
