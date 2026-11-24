import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{8,20}$/, "Invalid phone format")
    .optional()
    .nullable()
    .or(z.literal("")),
  parentName: z
    .string({ required_error: "Parent name is required" })
    .trim()
    .min(2, "Parent name must be at least 2 characters")
    .max(100, "Parent name cannot exceed 100 characters"),
  parentPhone: z
    .string({ required_error: "Parent phone is required" })
    .trim()
    .min(8, "Parent phone must be at least 8 digits")
    .max(20, "Parent phone cannot exceed 20 digits"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  classId: z.string().trim().optional(),
});

export const enrollStudentSchema = z.object({
  studentId: z.string({ required_error: "Student ID is required" }).trim().min(1),
  classId: z.string({ required_error: "Class ID is required" }).trim().min(1),
});

export const updateStudentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{8,20}$/, "Invalid phone format")
    .optional()
    .nullable()
    .or(z.literal("")),
  parentName: z
    .string()
    .trim()
    .min(2, "Parent name must be at least 2 characters")
    .max(100, "Parent name cannot exceed 100 characters")
    .optional(),
  parentPhone: z
    .string()
    .trim()
    .min(8, "Parent phone must be at least 8 digits")
    .max(20, "Parent phone cannot exceed 20 digits")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const queryStudentSchema = z.object({
  search: z.string().trim().optional(),
  classId: z.string().trim().optional(),
  excludeClassId: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type EnrollStudentDto = z.infer<typeof enrollStudentSchema>;
export type QueryStudentDto = z.infer<typeof queryStudentSchema>;
