import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateStudent } from "@/hooks/useStudents";
import type { StudentItem, UpdateStudentPayload } from "@/lib/students.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, AlertCircle, X } from "lucide-react";

const editStudentFormSchema = z.object({
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
  isActive: z.boolean(),
});

type EditStudentFormData = z.infer<typeof editStudentFormSchema>;

interface EditStudentModalProps {
  student: StudentItem | null;
  onClose: () => void;
}

export function EditStudentModal({ student, onClose }: EditStudentModalProps) {
  const updateMutation = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentFormSchema),
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName,
        phone: student.phone || "",
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        notes: student.notes || "",
        isActive: student.isActive,
      });
    }
  }, [student, reset]);

  useEffect(() => {
    if (!student) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updateMutation.isPending) handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [student, updateMutation.isPending, handleClose]);

  if (!student) return null;

  const onSubmit = async (data: EditStudentFormData) => {
    const payload: UpdateStudentPayload = {
      fullName: data.fullName.trim(),
      phone: data.phone?.trim() || null,
      parentName: data.parentName.trim(),
      parentPhone: data.parentPhone.trim(),
      notes: data.notes?.trim() || null,
      isActive: data.isActive,
    };

    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: payload,
      });
      handleClose();
    } catch {
      // Handled in mutation onError toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updateMutation.isPending) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Edit Student Profile
              </h3>
              <p className="text-xs text-neutral-500">
                Update details for &quot;{student.fullName}&quot;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
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
              disabled={isSubmitting || updateMutation.isPending}
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
                disabled={isSubmitting || updateMutation.isPending}
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
                disabled={isSubmitting || updateMutation.isPending}
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
                disabled={isSubmitting || updateMutation.isPending}
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
                Status
              </label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  disabled={isSubmitting || updateMutation.isPending}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Active student
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Notes (Optional)
            </label>
            <Input
              placeholder="e.g., Special preferences or notes"
              {...register("notes")}
              disabled={isSubmitting || updateMutation.isPending}
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
              disabled={isSubmitting || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || updateMutation.isPending}
              className="gap-1.5"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
