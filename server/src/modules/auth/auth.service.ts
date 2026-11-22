import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usersRepository } from "../users/users.repository.js";
import { LoginDto, RegisterDto } from "./auth.schema.js";
import { UnauthorizedError, ConflictError } from "../../core/errors/app-error.js";
import { env } from "../../config/env.js";
import { SafeUser } from "../users/users.types.js";

export class AuthService {
  async login(dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    const user = await usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: usersRepository.toSafeUser(user),
      token,
    };
  }

  async register(dto: RegisterDto): Promise<{ user: SafeUser; token: string }> {
    const existing = await usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: "staff",
      department: dto.department,
      position: dto.position,
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  private generateToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }
}

export const authService = new AuthService();
