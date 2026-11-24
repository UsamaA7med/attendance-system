import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  studentsApi,
  type StudentItem,
  type CreateStudentPayload,
  type UpdateStudentPayload,
  type EnrollStudentPayload,
  type StudentQueryParams,
} from "@/lib/students.api";
import { lectureKeys } from "@/hooks/useLectures";
import { classKeys } from "@/hooks/useClasses";
import { toast } from "sonner";

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (filters?: StudentQueryParams) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

export function useStudents(
  params?: StudentQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsApi.getAll(params),
    enabled: options?.enabled ?? true,
  });
}

export function useStudentsPaginated(
  params?: StudentQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsApi.getAllPaginated(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useStudentMetrics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...studentKeys.all, "metrics"],
    queryFn: () => studentsApi.getMetrics(),
    enabled: options?.enabled ?? true,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentPayload) => studentsApi.create(data),
    onSuccess: (newStudent: StudentItem) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Student added successfully", {
        description: `"${newStudent.fullName}" is now registered.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create student";
      toast.error("Failed to add student", { description: message });
    },
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollStudentPayload) => studentsApi.enroll(data),
    onSuccess: (student: StudentItem) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Student enrolled successfully", {
        description: `"${student.fullName}" is now enrolled in this class.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to enroll student";
      toast.error("Failed to enroll student", { description: message });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentPayload }) =>
      studentsApi.update(id, data),
    onSuccess: (updated: StudentItem) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Student updated successfully", {
        description: `Changes to "${updated.fullName}" have been saved.`,
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update student";
      toast.error("Failed to update student", { description: message });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Student deleted successfully", {
        description: "The student record has been removed.",
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete student";
      toast.error("Failed to delete student", { description: message });
    },
  });
}
