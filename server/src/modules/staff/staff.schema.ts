import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Staff name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  department: z.string().trim().optional().default("Operations"),
  position: z.string().trim().optional().default("Staff"),
  isActive: z.boolean().optional().default(true),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(2, "Staff name must be at least 2 characters").optional(),
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

export const queryStaffSchema = z.object({
  search: z.string().trim().optional(),
  isActive: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
export type QueryStaffDto = z.infer<typeof queryStaffSchema>;
