export type UserRole = "admin" | "staff" | "teacher" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type CreateUserData = Omit<User, "id" | "createdAt" | "isActive">;
export type SafeUser = Omit<User, "passwordHash">;
