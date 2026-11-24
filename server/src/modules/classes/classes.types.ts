export interface ClassTeacherSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
}

export interface ClassLectureSummary {
  id: string;
  date: string;
  startTime: string;
}

export interface ClassResponse {
  id: string;
  name: string;
  description: string | null;
  room: string | null;
  isActive: boolean;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher: ClassTeacherSummary;
  lectures: ClassLectureSummary[];
  enrollmentsCount: number;
  lecturesCount: number;
}

export interface CreateClassData {
  name: string;
  description?: string | null;
  room?: string | null;
  teacherId: string;
  isActive?: boolean;
}

export interface UpdateClassData {
  name?: string;
  description?: string | null;
  room?: string | null;
  teacherId?: string;
  isActive?: boolean;
}

export interface ClassFilters {
  search?: string;
  teacherId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
