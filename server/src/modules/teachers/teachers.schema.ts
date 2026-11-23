import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().trim().min(2, "Teacher name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  department: z.string().trim().optional().default("General"),
  position: z.string().trim().optional().default("Teacher"),
  isActive: z.boolean().optional().default(true),
});

export const updateTeacherSchema = z.object({
  name: z.string().trim().min(2, "Teacher name must be at least 2 characters").optional(),
  email: z.string().trim().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  department: z.string().trim().optional(),
  position: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const queryTeacherSchema = z.object({
  search: z.string().trim().optional(),
  isActive: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
export type QueryTeacherDto = z.infer<typeof queryTeacherSchema>;
