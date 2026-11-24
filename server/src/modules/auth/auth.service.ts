import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usersRepository } from "../users/users.repository.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { LoginDto, RegisterDto } from "./auth.schema.js";
import { TokenPair } from "./auth.types.js";
import { UnauthorizedError, ConflictError } from "../../core/errors/app-error.js";
import { env } from "../../config/env.js";
import { SafeUser } from "../users/users.types.js";

export function parseExpiryMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export class AuthService {
  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const user = await usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account has been deactivated");
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: usersRepository.toSafeUser(user),
      tokens,
    };
  }

  async register(dto: RegisterDto): Promise<{ user: SafeUser; tokens: TokenPair }> {
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
      phone: dto.phone,
    });

    const tokens = await this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // 1. Verify token signature
    let decoded: { userId: string; tokenType?: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        tokenType?: string;
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // 2. Validate token against repository (check expiry & revocation status)
    const validation = await refreshTokenRepository.isTokenValid(refreshToken);
    if (!validation.valid || !validation.record) {
      // Possible token theft or replay attempt: revoke all sessions for this user
      if (validation.record?.revokedAt) {
        const timeSinceRevocation = Date.now() - validation.record.revokedAt.getTime();
        // If revoked more than 15 seconds ago, treat as replay attack and invalidate all sessions.
        // If revoked within 15 seconds, treat as concurrent request / network race and reject safely.
        if (timeSinceRevocation > 15_000) {
          await refreshTokenRepository.revokeAllForUser(decoded.userId);
          throw new UnauthorizedError(
            "Refresh token reuse detected. All sessions invalidated. Please sign in again."
          );
        }
        throw new UnauthorizedError("Refresh token was already used");
      }
      throw new UnauthorizedError(validation.reason || "Invalid refresh token");
    }

    // 3. Ensure user still exists and is active
    const user = await usersRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User associated with this token no longer exists");
    }
    if (!user.isActive) {
      await refreshTokenRepository.revokeAllForUser(decoded.userId);
      throw new UnauthorizedError("Account has been deactivated");
    }

    // 4. Token Rotation: revoke current token and generate a fresh pair
    await refreshTokenRepository.revokeToken(refreshToken);

    return this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await refreshTokenRepository.revokeToken(refreshToken);
    }
    if (userId) {
      await refreshTokenRepository.revokeAllForUser(userId);
    }
  }

  private async generateTokenPair(payload: {
    userId: string;
    email: string;
    role: string;
  }): Promise<TokenPair> {
    const tokenId = randomUUID();

    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        jwtid: randomUUID(),
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        tokenType: "refresh",
      },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        jwtid: tokenId,
      }
    );

    const expiryDurationMs = parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiryDurationMs);

    await refreshTokenRepository.create({
      userId: payload.userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
