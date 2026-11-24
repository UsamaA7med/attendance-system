import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateStaff } from "@/hooks/useStaff";
import type { Staff, UpdateStaffPayload } from "@/lib/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, X } from "lucide-react";

const updateStaffFormSchema = z.object({
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

type UpdateStaffFormData = z.infer<typeof updateStaffFormSchema>;

interface EditStaffModalProps {
  staff: Staff | null;
  onClose: () => void;
}

export function EditStaffModal({ staff, onClose }: EditStaffModalProps) {
  const updateMutation = useUpdateStaff();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStaffFormData>({
    resolver: zodResolver(updateStaffFormSchema),
  });

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        email: staff.email,
        password: "",
        phone: staff.phone || "",
        department: staff.department || "",
        position: staff.position || "",
        isActive: staff.isActive,
      });
    }
  }, [staff, reset]);

  if (!staff) return null;

  const onSubmit = async (data: UpdateStaffFormData) => {
    const payload: UpdateStaffPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      department: data.department?.trim() || "Operations",
      position: data.position?.trim() || "Staff Member",
      isActive: data.isActive,
    };

    if (data.password && data.password.trim()) {
      payload.password = data.password.trim();
    }

    await updateMutation.mutateAsync({ id: staff.id, data: payload });
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
                Edit Staff Member
              </h3>
              <p className="text-xs text-neutral-500">
                Update information and operational credentials for {staff.name}
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
              <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input type="email" {...register("email")} className="mt-1" />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Reset Password
              </label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Leave blank to keep unchanged"
                className="mt-1"
              />
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Department
              </label>
              <Input {...register("department")} className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Position / Title
              </label>
              <Input {...register("position")} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Phone Number
            </label>
            <Input {...register("phone")} className="mt-1" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editIsActiveStaff"
              {...register("isActive")}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <label
              htmlFor="editIsActiveStaff"
              className="text-xs text-neutral-700 dark:text-neutral-300 select-none cursor-pointer"
            >
              Account Active
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
