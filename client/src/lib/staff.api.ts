import { api, type PaginationMeta } from "./api";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "staff";
  department: string;
  position: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  markedAttendancesCount?: number;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface StaffMetricsData {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export interface StaffQueryParams {
  search?: string;
  isActive?: boolean | "all" | string;
  page?: number;
  limit?: number;
}

export const staffApi = {
  getAll: async (params?: StaffQueryParams): Promise<Staff[]> => {
    const res = await api.get<{ data: Staff[] }>("/staff", { params });
    return res.data.data;
  },

  getAllPaginated: async (
    params?: StaffQueryParams
  ): Promise<{ data: Staff[]; pagination?: PaginationMeta }> => {
    const res = await api.get<{ data: Staff[]; pagination?: PaginationMeta }>("/staff", {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getById: async (id: string): Promise<Staff> => {
    const res = await api.get<{ data: Staff }>(`/staff/${id}`);
    return res.data.data;
  },

  create: async (data: CreateStaffPayload): Promise<Staff> => {
    const res = await api.post<{ data: Staff }>("/staff", data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateStaffPayload): Promise<Staff> => {
    const res = await api.patch<{ data: Staff }>(`/staff/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff/${id}`);
  },

  getMetrics: async (): Promise<StaffMetricsData> => {
    const res = await api.get<{ data: StaffMetricsData }>("/staff/metrics");
    return res.data.data;
  },
};
