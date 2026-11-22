import bcrypt from "bcryptjs";
import { User, CreateUserData, SafeUser } from "./users.types.js";

class UsersRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    const passwordHash = bcrypt.hashSync("password123", 10);
    const defaults: User[] = [
      {
        id: "usr-1",
        name: "Osama Admin",
        email: "osama@attendance.local",
        passwordHash,
        role: "admin",
        department: "Engineering",
        position: "Lead Architect",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-2",
        name: "Sarah Jenkins",
        email: "sarah@attendance.local",
        passwordHash,
        role: "staff",
        department: "Design",
        position: "UI/UX Designer",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-3",
        name: "Alex Rivera",
        email: "alex@attendance.local",
        passwordHash,
        role: "staff",
        department: "DevOps",
        position: "DevOps Engineer",
        createdAt: new Date().toISOString(),
      },
    ];

    defaults.forEach((user) => this.users.set(user.id, user));
  }

  async findAll(): Promise<SafeUser[]> {
    return Array.from(this.users.values()).map(this.toSafeUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async create(data: CreateUserData): Promise<SafeUser> {
    const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const user: User = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return this.toSafeUser(user);
  }

  async update(id: string, updates: Partial<Omit<User, "id" | "passwordHash">>): Promise<SafeUser | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return this.toSafeUser(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  toSafeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const usersRepository = new UsersRepository();
