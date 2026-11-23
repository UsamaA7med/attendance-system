import { api } from "./api";

export interface TeacherClass {
  id: string;
  name: string;
  room?: string | null;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "teacher";
  department: string;
  position: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classesCount: number;
  classes: TeacherClass[];
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface UpdateTeacherPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface TeacherQueryParams {
  search?: string;
  isActive?: boolean | "all" | string;
}

export const teachersApi = {
  getAll: async (params?: TeacherQueryParams): Promise<Teacher[]> => {
    const res = await api.get<{ data: Teacher[] }>("/teachers", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await api.get<{ data: Teacher }>(`/teachers/${id}`);
    return res.data.data;
  },

  create: async (data: CreateTeacherPayload): Promise<Teacher> => {
    const res = await api.post<{ data: Teacher }>("/teachers", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateTeacherPayload): Promise<Teacher> => {
    const res = await api.patch<{ data: Teacher }>(`/teachers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/teachers/${id}`);
  },
};
