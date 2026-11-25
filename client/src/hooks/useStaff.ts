import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  staffApi,
  type Staff,
  type CreateStaffPayload,
  type UpdateStaffPayload,
  type StaffQueryParams,
} from "@/lib/staff.api";
import { getFriendlyErrorDescription } from "@/lib/toast-errors";
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
      toast.success("Staff account created", {
        description: `${newStaff.name} was added to the staff list.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't create staff account", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please check the staff details and try again.",
          conflict: "An account with this email already exists.",
        }),
      });
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
      toast.success("Staff details updated", {
        description: `Changes to ${updated.name} have been saved.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't update staff account", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please review the changes and try again.",
          conflict: "An account with this email already exists.",
        }),
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Staff account deleted", {
        description: "The staff account has been removed.",
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't delete staff account", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please try again.",
          conflict:
            "This staff account has scheduled lectures or attendance records. Deactivate the account instead.",
        }),
      });
    },
  });
}
