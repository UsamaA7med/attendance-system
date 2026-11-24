import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createLectureSchema = z.object({
  classId: z
    .string({ required_error: "Class ID is required" })
    .trim()
    .min(1, "Class ID must not be empty"),
  date: z
    .string({ required_error: "Date is required" })
    .regex(dateRegex, "Date must be formatted as YYYY-MM-DD (e.g. 2026-11-23)"),
  startTime: z
    .string({ required_error: "Start time is required" })
    .regex(timeRegex, "Start time must be formatted as HH:mm (e.g. 14:00)"),
  notes: z.string().trim().optional().nullable(),
});

export const updateLectureSchema = z.object({
  date: z
    .string()
    .regex(dateRegex, "Date must be formatted as YYYY-MM-DD (e.g. 2026-11-23)")
    .optional(),
  startTime: z
    .string()
    .regex(timeRegex, "Start time must be formatted as HH:mm (e.g. 14:00)")
    .optional(),
  notes: z.string().trim().optional().nullable(),
});

export const queryLectureSchema = z.object({
  classId: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || (val > 0 && val <= 100),
      "Limit must be between 1 and 100"
    ),
});

export const updateLectureAttendanceSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().min(1, "Student ID is required"),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      note: z.string().trim().optional().nullable(),
    })
  ),
});

export type CreateLectureDto = z.infer<typeof createLectureSchema>;
export type UpdateLectureDto = z.infer<typeof updateLectureSchema>;
export type QueryLectureDto = z.infer<typeof queryLectureSchema>;
export type UpdateLectureAttendanceDto = z.infer<typeof updateLectureAttendanceSchema>;
