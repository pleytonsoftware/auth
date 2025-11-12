import { describe, test, expect, beforeEach } from 'bun:test';
import { JwtService } from '../../../src/infrastructure/security/jwt-service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    // Set environment variables for testing
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_EXPIRATION = '7d';
    
    jwtService = new JwtService();
  });

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const userId = '01HQXYZ123';
      const token = jwtService.generateAccessToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const userId = '01HQXYZ123';
      const token = jwtService.generateRefreshToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify a valid access token', () => {
      const userId = '01HQXYZ123';
      const token = jwtService.generateAccessToken(userId);

      const payload = jwtService.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(userId);
    });

    test('should return null for invalid token', () => {
      const payload = jwtService.verifyAccessToken('invalid-token');

      expect(payload).toBeNull();
    });

    test('should return null for expired token', () => {
      // Create a service with very short expiration
      process.env.JWT_EXPIRATION = '1ms';
      const shortLivedService = new JwtService();
      
      const userId = '01HQXYZ123';
      const token = shortLivedService.generateAccessToken(userId);

      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const payload = shortLivedService.verifyAccessToken(token);
          expect(payload).toBeNull();
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify a valid refresh token', () => {
      const userId = '01HQXYZ123';
      const token = jwtService.generateRefreshToken(userId);

      const payload = jwtService.verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(userId);
    });

    test('should return null for invalid refresh token', () => {
      const payload = jwtService.verifyRefreshToken('invalid-refresh-token');

      expect(payload).toBeNull();
    });

    test('should not verify access token with refresh secret', () => {
      const userId = '01HQXYZ123';
      const accessToken = jwtService.generateAccessToken(userId);

      const payload = jwtService.verifyRefreshToken(accessToken);

      expect(payload).toBeNull();
    });
  });
});
