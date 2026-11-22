export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "staff" | "manager";
  department: string;
  position: string;
  createdAt: string;
}

export type CreateUserData = Omit<User, "id" | "createdAt">;
export type SafeUser = Omit<User, "passwordHash">;
