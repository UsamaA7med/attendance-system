import { SafeUser } from "../users/users.types.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenRecord {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}
