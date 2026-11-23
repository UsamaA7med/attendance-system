import { RefreshTokenRecord } from "./auth.types.js";

export class RefreshTokenRepository {
  private tokens: Map<string, RefreshTokenRecord> = new Map();

  async create(data: { userId: string; token: string; expiresAt: Date }): Promise<RefreshTokenRecord> {
    const record: RefreshTokenRecord = {
      id: `rt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    };
    this.tokens.set(data.token, record);
    return record;
  }

  async findByToken(token: string): Promise<RefreshTokenRecord | null> {
    return this.tokens.get(token) || null;
  }

  async revokeToken(token: string): Promise<boolean> {
    const record = this.tokens.get(token);
    if (!record) return false;
    record.revokedAt = new Date();
    this.tokens.set(token, record);
    return true;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    let count = 0;
    for (const [key, record] of this.tokens.entries()) {
      if (record.userId === userId && !record.revokedAt) {
        record.revokedAt = new Date();
        this.tokens.set(key, record);
        count++;
      }
    }
    return count;
  }

  async isTokenValid(token: string): Promise<{ valid: boolean; record: RefreshTokenRecord | null; reason?: string }> {
    const record = await this.findByToken(token);
    if (!record) {
      return { valid: false, record: null, reason: "Token not found" };
    }
    if (record.revokedAt) {
      return { valid: false, record, reason: "Token has been revoked" };
    }
    if (new Date() > record.expiresAt) {
      return { valid: false, record, reason: "Token has expired" };
    }
    return { valid: true, record };
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
