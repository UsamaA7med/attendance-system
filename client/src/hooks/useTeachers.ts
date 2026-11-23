import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teachersApi,
  type Teacher,
  type CreateTeacherPayload,
  type UpdateTeacherPayload,
  type TeacherQueryParams,
} from "@/lib/teachers.api";
import { toast } from "sonner";

export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (filters?: TeacherQueryParams) => [...teacherKeys.lists(), filters] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
};

export function useTeachers(
  params?: TeacherQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teachersApi.getAll(params),
    enabled: options?.enabled ?? true,
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teachersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherPayload) => teachersApi.create(data),
    onSuccess: (newTeacher: Teacher) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Teacher created successfully", {
        description: `${newTeacher.name} has been added to the center system.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create teacher";
      toast.error("Failed to create teacher", { description: message });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherPayload }) =>
      teachersApi.update(id, data),
    onSuccess: (updated: Teacher) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Teacher updated successfully", {
        description: `Changes to ${updated.name} have been saved.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update teacher";
      toast.error("Failed to update teacher", { description: message });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teachersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Teacher deleted successfully", {
        description: "Teacher was removed from the system.",
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete teacher";
      toast.error("Deletion not permitted", {
        description: message,
        duration: 5000,
      });
    },
  });
}
