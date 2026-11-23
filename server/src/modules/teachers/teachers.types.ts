export interface TeacherClassSummary {
  id: string;
  name: string;
  room?: string | null;
  isActive: boolean;
}

export interface TeacherResponse {
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
  classes: TeacherClassSummary[];
}

export interface CreateTeacherData {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface UpdateTeacherData {
  name?: string;
  email?: string;
  passwordHash?: string;
  phone?: string | null;
  department?: string;
  position?: string;
  isActive?: boolean;
}
