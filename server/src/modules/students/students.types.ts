import { EnrollmentStatus } from "@prisma/client";

export interface StudentEnrollmentItem {
  id: string;
  classId: string;
  className: string;
  room?: string | null;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface StudentResponse {
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

export interface CreateStudentInput {
  fullName: string;
  phone?: string | null;
  parentName: string;
  parentPhone: string;
  notes?: string | null;
  classId?: string;
}

export interface UpdateStudentInput {
  fullName?: string;
  phone?: string | null;
  parentName?: string;
  parentPhone?: string;
  notes?: string | null;
  isActive?: boolean;
}
