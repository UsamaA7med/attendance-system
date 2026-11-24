import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  staffApi,
  type Staff,
  type CreateStaffPayload,
  type UpdateStaffPayload,
  type StaffQueryParams,
} from "@/lib/staff.api";
import { toast } from "sonner";

export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (filters?: StaffQueryParams) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, "detail"] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
};

export function useStaff(
  params?: StaffQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.getAll(params),
    enabled: options?.enabled ?? true,
  });
}

export function useStaffPaginated(
  params?: StaffQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.getAllPaginated(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useStaffMetrics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...staffKeys.all, "metrics"],
    queryFn: () => staffApi.getMetrics(),
    enabled: options?.enabled ?? true,
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffPayload) => staffApi.create(data),
    onSuccess: (newStaff: Staff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Staff registered successfully", {
        description: `${newStaff.name} has been added as a staff member.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to register staff member";
      toast.error("Failed to register staff member", { description: message });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffPayload }) =>
      staffApi.update(id, data),
    onSuccess: (updated: Staff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Staff updated successfully", {
        description: `Changes to ${updated.name} have been saved.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update staff member";
      toast.error("Failed to update staff member", { description: message });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Staff deleted successfully", {
        description: "The staff account has been removed.",
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete staff member";
      toast.error("Deletion Failed", { description: message });
    },
  });
}
