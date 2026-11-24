import { api, type PaginationMeta } from "./api";

export interface LectureClass {
  id: string;
  name: string;
  room?: string | null;
  teacher?: {
    id: string;
    name: string;
  };
}

export interface LectureAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface LectureItem {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  class: LectureClass;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  attendanceSummary: LectureAttendanceSummary;
}

export interface CreateLecturePayload {
  classId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string | null;
}

export interface UpdateLecturePayload {
  date?: string;
  startTime?: string;
  notes?: string | null;
}

export interface LectureQueryParams {
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type AttendanceStatusType = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  fullName: string;
  phone: string | null;
  parentPhone: string;
  status: AttendanceStatusType;
  note: string | null;
  markedAt: string | null;
  markedByName: string | null;
}

export interface LectureAttendanceDetails {
  lecture: LectureItem;
  students: StudentAttendanceRecord[];
}

export interface UpdateLectureAttendancePayload {
  records: Array<{
    studentId: string;
    status: AttendanceStatusType;
    note?: string | null;
  }>;
}

export const lecturesApi = {
  getAll: async (params?: LectureQueryParams): Promise<LectureItem[]> => {
    const res = await api.get<{ data: LectureItem[] }>("/lectures", { params });
    return res.data.data;
  },

  getAllPaginated: async (
    params?: LectureQueryParams
  ): Promise<{ data: LectureItem[]; pagination?: PaginationMeta }> => {
    const res = await api.get<{ data: LectureItem[]; pagination?: PaginationMeta }>("/lectures", {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getById: async (id: string): Promise<LectureItem> => {
    const res = await api.get<{ data: LectureItem }>(`/lectures/${id}`);
    return res.data.data;
  },

  create: async (data: CreateLecturePayload): Promise<LectureItem> => {
    const res = await api.post<{ data: LectureItem }>("/lectures", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateLecturePayload): Promise<LectureItem> => {
    const res = await api.patch<{ data: LectureItem }>(`/lectures/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lectures/${id}`);
  },

  getAttendance: async (lectureId: string): Promise<LectureAttendanceDetails> => {
    const res = await api.get<{ data: LectureAttendanceDetails }>(`/lectures/${lectureId}/attendance`);
    return res.data.data;
  },

  updateAttendance: async (lectureId: string, payload: UpdateLectureAttendancePayload): Promise<void> => {
    await api.put(`/lectures/${lectureId}/attendance`, payload);
  },
};
