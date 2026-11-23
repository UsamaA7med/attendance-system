import { z } from "zod";

export const createClassSchema = z.object({
  name: z
    .string({ required_error: "Class name is required" })
    .trim()
    .min(2, "Class name must be at least 2 characters")
    .max(100, "Class name cannot exceed 100 characters"),
  description: z.string().trim().optional().nullable(),
  room: z.string().trim().max(50, "Room name cannot exceed 50 characters").optional().nullable(),
  teacherId: z
    .string({ required_error: "Teacher ID is required" })
    .trim()
    .min(1, "Teacher ID must not be empty"),
  isActive: z.boolean().optional().default(true),
});

export const updateClassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Class name must be at least 2 characters")
    .max(100, "Class name cannot exceed 100 characters")
    .optional(),
  description: z.string().trim().optional().nullable(),
  room: z.string().trim().max(50, "Room name cannot exceed 50 characters").optional().nullable(),
  teacherId: z.string().trim().min(1, "Teacher ID must not be empty").optional(),
  isActive: z.boolean().optional(),
});

export const queryClassSchema = z.object({
  search: z.string().optional(),
  teacherId: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateClassDto = z.infer<typeof createClassSchema>;
export type UpdateClassDto = z.infer<typeof updateClassSchema>;
export type QueryClassDto = z.infer<typeof queryClassSchema>;
