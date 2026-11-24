import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTeacher } from "@/hooks/useTeachers";
import type { Teacher, UpdateTeacherPayload } from "@/lib/teachers.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, X } from "lucide-react";

const updateTeacherFormSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "New password must be at least 6 characters if provided",
    }),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UpdateTeacherFormData = z.infer<typeof updateTeacherFormSchema>;

interface EditTeacherModalProps {
  teacher: Teacher | null;
  onClose: () => void;
}

export function EditTeacherModal({ teacher, onClose }: EditTeacherModalProps) {
  const updateMutation = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeacherFormData>({
    resolver: zodResolver(updateTeacherFormSchema),
  });

  useEffect(() => {
    if (teacher) {
      reset({
        name: teacher.name,
        email: teacher.email,
        password: "",
        phone: teacher.phone || "",
        department: teacher.department || "",
        position: teacher.position || "",
        isActive: teacher.isActive,
      });
    }
  }, [teacher, reset]);

  if (!teacher) return null;

  const onSubmit = async (data: UpdateTeacherFormData) => {
    const payload: UpdateTeacherPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      department: data.department?.trim() || "General",
      position: data.position?.trim() || "Teacher",
      isActive: data.isActive,
    };

    if (data.password && data.password.trim()) {
      payload.password = data.password.trim();
    }

    await updateMutation.mutateAsync({ id: teacher.id, data: payload });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Edit className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Edit Teacher Details
              </h3>
              <p className="text-xs text-neutral-500">
                Update information for {teacher.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input type="email" {...register("email")} className="mt-1" />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Leave empty to keep current"
                {...register("password")}
                className="mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Phone Number
              </label>
              <Input {...register("phone")} className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Department
              </label>
              <Input {...register("department")} className="mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Active teacher status</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="gap-1.5"
            >
              {isSubmitting || updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
