import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStudent } from "@/hooks/useStudents";
import type { ClassItem } from "@/lib/classes.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, AlertCircle, X } from "lucide-react";

const createStudentFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{8,20}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  parentName: z
    .string()
    .trim()
    .min(2, "Parent name must be at least 2 characters")
    .max(100, "Parent name cannot exceed 100 characters"),
  parentPhone: z
    .string()
    .trim()
    .min(8, "Parent phone must be at least 8 digits")
    .max(20, "Parent phone cannot exceed 20 digits"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  classId: z.string().optional(),
});

type CreateStudentFormData = z.infer<typeof createStudentFormSchema>;

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes?: ClassItem[];
  preselectedClassId?: string | null;
}

export function CreateStudentModal({
  isOpen,
  onClose,
  classes = [],
  preselectedClassId,
}: CreateStudentModalProps) {
  const createMutation = useCreateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      parentName: "",
      parentPhone: "",
      notes: "",
      classId: preselectedClassId || "",
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createMutation.isPending) handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, createMutation.isPending, handleClose]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateStudentFormData) => {
    try {
      await createMutation.mutateAsync({
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        parentName: data.parentName.trim(),
        parentPhone: data.parentPhone.trim(),
        notes: data.notes?.trim() || null,
        classId: data.classId || undefined,
      });
      handleClose();
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !createMutation.isPending) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Register New Student
              </h3>
              <p className="text-xs text-neutral-500">
                Onboard a student and optionally enroll them in an active class.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g., Omar Youssef"
              {...register("fullName")}
              disabled={isSubmitting || createMutation.isPending}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Guardian / Parent Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., Youssef Ibrahim"
                {...register("parentName")}
                disabled={isSubmitting || createMutation.isPending}
              />
              {errors.parentName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.parentName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Parent Phone Number <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., +201011112222"
                {...register("parentPhone")}
                disabled={isSubmitting || createMutation.isPending}
              />
              {errors.parentPhone && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.parentPhone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Student Phone (Optional)
              </label>
              <Input
                placeholder="e.g., +201111222333"
                {...register("phone")}
                disabled={isSubmitting || createMutation.isPending}
              />
              {errors.phone && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Enroll in Class (Optional)
              </label>
              <select
                {...register("classId")}
                disabled={isSubmitting || createMutation.isPending}
                className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              >
                <option value="">No immediate enrollment</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.room ? `(${c.room})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Notes (Optional)
            </label>
            <Input
              placeholder="e.g., Special preferences or notes"
              {...register("notes")}
              disabled={isSubmitting || createMutation.isPending}
            />
            {errors.notes && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting || createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || createMutation.isPending}
              className="gap-1.5"
            >
              {createMutation.isPending ? "Registering..." : "Create Student"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
