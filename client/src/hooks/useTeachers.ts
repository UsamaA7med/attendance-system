import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  teachersApi,
  type Teacher,
  type CreateTeacherPayload,
  type UpdateTeacherPayload,
  type TeacherQueryParams,
} from "@/lib/teachers.api";
import { getFriendlyErrorDescription } from "@/lib/toast-errors";
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

export function useTeachersPaginated(
  params?: TeacherQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teachersApi.getAllPaginated(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTeacherMetrics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...teacherKeys.all, "metrics"],
    queryFn: () => teachersApi.getMetrics(),
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
      toast.success("Teacher account created", {
        description: `${newTeacher.name} was added to the teacher list.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't create teacher", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please check the teacher details and try again.",
          conflict: "An account with this email already exists.",
        }),
      });
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
      toast.success("Teacher details updated", {
        description: `Changes to ${updated.name} have been saved.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't update teacher", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please review the changes and try again.",
          conflict: "An account with this email already exists.",
        }),
      });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teachersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
      toast.success("Teacher account deleted", {
        description: "The teacher account has been removed.",
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't delete teacher", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please try again.",
          conflict:
            "This teacher has classes, scheduled lectures, or attendance records. Reassign them or deactivate the account instead.",
        }),
        duration: 5000,
      });
    },
  });
}
