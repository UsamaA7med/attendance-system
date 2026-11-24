export interface StaffResponse {
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

export interface CreateStaffData {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  passwordHash?: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface StaffMetrics {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}
