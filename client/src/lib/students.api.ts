import { api, type PaginationMeta } from "./api";

export interface StudentEnrollmentItem {
  id: string;
  classId: string;
  className: string;
  room?: string | null;
  status: "ACTIVE" | "DROPPED";
  enrolledAt: string;
}

export interface StudentItem {
  id: string;
  fullName: string;
  phone: string | null;
  parentName: string;
  parentPhone: string;
  notes: string | null;
  isActive: boolean;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  enrollments?: StudentEnrollmentItem[];
}

export interface CreateStudentPayload {
  fullName: string;
  phone?: string | null;
  parentName: string;
  parentPhone: string;
  notes?: string | null;
  classId?: string;
}

export interface UpdateStudentPayload {
  fullName?: string;
  phone?: string | null;
  parentName?: string;
  parentPhone?: string;
  notes?: string | null;
  isActive?: boolean;
}

export interface EnrollStudentPayload {
  studentId: string;
  classId: string;
}

export interface StudentQueryParams {
  search?: string;
  classId?: string;
  excludeClassId?: string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export const studentsApi = {
  getAll: async (params?: StudentQueryParams): Promise<StudentItem[]> => {
    const res = await api.get<{ data: StudentItem[] }>("/students", { params });
    return res.data.data;
  },

  getAllPaginated: async (
    params?: StudentQueryParams
  ): Promise<{ data: StudentItem[]; pagination?: PaginationMeta }> => {
    const res = await api.get<{ data: StudentItem[]; pagination?: PaginationMeta }>("/students", {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getById: async (id: string): Promise<StudentItem> => {
    const res = await api.get<{ data: StudentItem }>(`/students/${id}`);
    return res.data.data;
  },

  create: async (data: CreateStudentPayload): Promise<StudentItem> => {
    const res = await api.post<{ data: StudentItem }>("/students", data);
    return res.data.data;
  },

  enroll: async (data: EnrollStudentPayload): Promise<StudentItem> => {
    const res = await api.post<{ data: StudentItem }>("/students/enroll", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateStudentPayload): Promise<StudentItem> => {
    const res = await api.put<{ data: StudentItem }>(`/students/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },
};
