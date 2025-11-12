export interface IAuthService {
  generateAccessToken(userId: string): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): { userId: string } | null;
  verifyRefreshToken(token: string): { userId: string } | null;
}
