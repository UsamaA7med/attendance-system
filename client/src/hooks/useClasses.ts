import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  classesApi,
  type ClassItem,
  type CreateClassPayload,
  type UpdateClassPayload,
  type ClassQueryParams,
} from "@/lib/classes.api";
import { toast } from "sonner";

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (filters?: ClassQueryParams) => [...classKeys.lists(), filters] as const,
  details: () => [...classKeys.all, "detail"] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
};

export function useClasses(
  params?: ClassQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classesApi.getAll(params),
    enabled: options?.enabled ?? true,
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassPayload) => classesApi.create(data),
    onSuccess: (newClass: ClassItem) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Class created successfully", {
        description: `"${newClass.name}" has been created.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create class";
      toast.error("Failed to create class", { description: message });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassPayload }) =>
      classesApi.update(id, data),
    onSuccess: (updated: ClassItem) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Class updated successfully", {
        description: `Changes to "${updated.name}" have been saved.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update class";
      toast.error("Failed to update class", { description: message });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Class deleted successfully", {
        description: "The class and its associated schedules have been removed.",
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete class";
      toast.error("Deletion not permitted", {
        description: message,
        duration: 5000,
      });
    },
  });
}
