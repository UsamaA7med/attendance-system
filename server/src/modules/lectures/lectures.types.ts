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

export interface LectureResponse {
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

export interface CreateLectureData {
  classId: string;
  date: Date;
  startTime: string;
  notes?: string | null;
  createdById: string;
}

export interface UpdateLectureData {
  date?: Date;
  startTime?: string;
  notes?: string | null;
}

export interface LectureFilters {
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
}
