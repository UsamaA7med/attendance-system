export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeName: string;
  department: string;
  role: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO or HH:MM AM/PM
  checkOut?: string;
  durationMinutes?: number;
  status: "present" | "late" | "absent" | "half-day";
  note?: string;
  createdAt: string;
}

export type CreateAttendanceData = Omit<AttendanceRecord, "id" | "createdAt">;
