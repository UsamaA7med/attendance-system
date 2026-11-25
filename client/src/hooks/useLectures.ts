import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  lecturesApi,
  type LectureItem,
  type CreateLecturePayload,
  type UpdateLecturePayload,
  type LectureQueryParams,
  type UpdateLectureAttendancePayload,
} from "@/lib/lectures.api";
import { classKeys } from "./useClasses";
import { getFriendlyErrorDescription } from "@/lib/toast-errors";
import { toast } from "sonner";

export const lectureKeys = {
  all: ["lectures"] as const,
  lists: () => [...lectureKeys.all, "list"] as const,
  list: (filters?: LectureQueryParams) => [...lectureKeys.lists(), filters] as const,
  details: () => [...lectureKeys.all, "detail"] as const,
  detail: (id: string) => [...lectureKeys.details(), id] as const,
  attendances: () => [...lectureKeys.all, "attendance"] as const,
  attendance: (lectureId: string) => [...lectureKeys.attendances(), lectureId] as const,
};

export function useLectures(
  params?: LectureQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: lectureKeys.list(params),
    queryFn: () => lecturesApi.getAll(params),
    enabled: options?.enabled ?? true,
  });
}

export function useLecturesPaginated(
  params?: LectureQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: lectureKeys.list(params),
    queryFn: () => lecturesApi.getAllPaginated(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useLecture(id: string) {
  return useQuery({
    queryKey: lectureKeys.detail(id),
    queryFn: () => lecturesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useLectureAttendance(lectureId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: lectureKeys.attendance(lectureId),
    queryFn: () => lecturesApi.getAttendance(lectureId),
    enabled: (options?.enabled ?? true) && Boolean(lectureId),
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLecturePayload) => lecturesApi.create(data),
    onSuccess: (newLecture: LectureItem) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Lecture scheduled", {
        description: `"${newLecture.class.name}" on ${newLecture.date} at ${newLecture.startTime}.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't schedule lecture", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please check the lecture details and try again.",
          conflict: "A lecture is already scheduled for this class at that date and time.",
        }),
      });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLecturePayload }) =>
      lecturesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Lecture details updated");
    },
    onError: (err: unknown) => {
      toast.error("Couldn't update lecture", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please review the changes and try again.",
          conflict: "A lecture is already scheduled for this class at that date and time.",
        }),
      });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lecturesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success("Lecture deleted");
    },
    onError: (err: unknown) => {
      toast.error("Couldn't delete lecture", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please try again.",
        }),
      });
    },
  });
}

export function useUpdateLectureAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lectureId,
      data,
    }: {
      lectureId: string;
      data: UpdateLectureAttendancePayload;
    }) => lecturesApi.updateAttendance(lectureId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: lectureKeys.attendance(variables.lectureId),
      });
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      toast.success("Attendance saved", {
        description: "Student roll-call statuses have been recorded.",
      });
    },
    onError: (err: unknown) => {
      toast.error("Couldn't save attendance", {
        description: getFriendlyErrorDescription(err, {
          fallback: "Please review the attendance and try again.",
        }),
      });
    },
  });
}
