import jwt from 'jsonwebtoken';
import { IAuthService } from '../../domain/services/IAuthService';

export class JwtService implements IAuthService {
  private jwtSecret: string;
  private jwtExpiration: string;
  private jwtRefreshSecret: string;
  private jwtRefreshExpiration: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '15m';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
  }

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiration,
    });
  }

  verifyAccessToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { userId: string };
      return payload;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.jwtRefreshSecret) as { userId: string };
      return payload;
    } catch (error) {
      return null;
    }
  }
}
