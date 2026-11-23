export type UserRole = "admin" | "staff" | "teacher" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
}

export type CreateUserData = Omit<User, "id" | "createdAt">;
export type SafeUser = Omit<User, "passwordHash">;
