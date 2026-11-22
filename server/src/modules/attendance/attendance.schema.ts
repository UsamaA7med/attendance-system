import { z } from "zod";

export const checkInSchema = z.object({
  employeeName: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  note: z.string().max(200).optional(),
});

export const checkOutSchema = z.object({
  note: z.string().max(200).optional(),
});

export const attendanceQuerySchema = z.object({
  userId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
  status: z.enum(["present", "late", "absent", "half-day"]).optional(),
  department: z.string().optional(),
});

export type CheckInDto = z.infer<typeof checkInSchema>;
export type CheckOutDto = z.infer<typeof checkOutSchema>;
export type AttendanceQueryDto = z.infer<typeof attendanceQuerySchema>;
