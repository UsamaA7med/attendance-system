import { api } from "./api";

export interface ClassTeacher {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
}

export interface ClassLectureItem {
  id: string;
  date: string;
  startTime: string;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  room: string | null;
  isActive: boolean;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher: ClassTeacher;
  lectures: ClassLectureItem[];
  enrollmentsCount: number;
  lecturesCount: number;
}

export interface CreateClassPayload {
  name: string;
  description?: string | null;
  room?: string | null;
  teacherId: string;
  isActive?: boolean;
}

export interface UpdateClassPayload {
  name?: string;
  description?: string | null;
  room?: string | null;
  teacherId?: string;
  isActive?: boolean;
}

export interface ClassQueryParams {
  search?: string;
  teacherId?: string;
  isActive?: boolean | string;
}

export const classesApi = {
  getAll: async (params?: ClassQueryParams): Promise<ClassItem[]> => {
    const res = await api.get<{ data: ClassItem[] }>("/classes", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<ClassItem> => {
    const res = await api.get<{ data: ClassItem }>(`/classes/${id}`);
    return res.data.data;
  },

  create: async (data: CreateClassPayload): Promise<ClassItem> => {
    const res = await api.post<{ data: ClassItem }>("/classes", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateClassPayload): Promise<ClassItem> => {
    const res = await api.patch<{ data: ClassItem }>(`/classes/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },
};
