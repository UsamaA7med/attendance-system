import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  classesApi,
  type ClassItem,
  type CreateClassPayload,
  type UpdateClassPayload,
  type ClassQueryParams,
} from "@/lib/classes.api";
import { getFriendlyErrorDescription } from "@/lib/toast-errors";
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

export function useClassesPaginated(
  params?: ClassQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classesApi.getAllPaginated(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useClassMetrics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...classKeys.all, "metrics"],
    queryFn: () => classesApi.getMetrics(),
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
      toast.success("Class created", {
        description: `"${newClass.name}" has been created.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't create class", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please check the class details and try again.",
        }),
      });
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
      toast.success("Class details updated", {
        description: `Changes to "${updated.name}" have been saved.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't update class", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please review the changes and try again.",
        }),
      });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Class deleted", {
        description: "The class and its associated schedules have been removed.",
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't delete class", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please try again.",
        }),
        duration: 5000,
      });
    },
  });
}
