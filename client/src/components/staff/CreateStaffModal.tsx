import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStaff } from "@/hooks/useStaff";
import type { CreateStaffPayload } from "@/lib/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, X } from "lucide-react";

const createStaffFormSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CreateStaffFormData = z.infer<typeof createStaffFormSchema>;

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
  const createMutation = useCreateStaff();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "Operations",
      position: "Staff Member",
      isActive: true,
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateStaffFormData) => {
    const payload: CreateStaffPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      phone: data.phone?.trim() || null,
      department: data.department?.trim() || "Operations",
      position: data.position?.trim() || "Staff Member",
      isActive: data.isActive,
    };

    await createMutation.mutateAsync(payload);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Register New Staff Member
              </h3>
              <p className="text-xs text-neutral-500">
                Create login credentials and operations access for center staff.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
            <Input
              {...register("name")}
              placeholder="e.g. John Doe"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                {...register("email")}
                placeholder="staff@example.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••••"
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
              <Input
                {...register("department")}
                placeholder="e.g. Operations, Admissions"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Position / Title
              </label>
              <Input
                {...register("position")}
                placeholder="e.g. Front Desk, Coordinator"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Phone Number
            </label>
            <Input
              {...register("phone")}
              placeholder="e.g. +1 555-0199"
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveStaff"
              {...register("isActive")}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <label
              htmlFor="isActiveStaff"
              className="text-xs text-neutral-700 dark:text-neutral-300 select-none cursor-pointer"
            >
              Set account active immediately (allows portal login)
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
              disabled={isSubmitting}
              className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              {isSubmitting ? "Registering..." : "Register Staff Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
