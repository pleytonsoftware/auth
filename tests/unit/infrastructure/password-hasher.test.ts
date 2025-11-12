import { describe, test, expect } from 'bun:test';
import { PasswordHasher } from '../../../src/infrastructure/security/password-hasher';

describe('PasswordHasher', () => {
  const passwordHasher = new PasswordHasher();

  describe('hash', () => {
    test('should hash a password', async () => {
      const password = 'SecurePassword123';
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123';
      const hash1 = await passwordHasher.hash(password);
      const hash2 = await passwordHasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    test('should hash different passwords differently', async () => {
      const password1 = 'Password123';
      const password2 = 'DifferentPassword456';
      
      const hash1 = await passwordHasher.hash(password1);
      const hash2 = await passwordHasher.hash(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    test('should return true for matching password and hash', async () => {
      const password = 'SecurePassword123';
      const hash = await passwordHasher.hash(password);

      const result = await passwordHasher.compare(password, hash);

      expect(result).toBe(true);
    });

    test('should return false for non-matching password and hash', async () => {
      const password = 'SecurePassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await passwordHasher.hash(password);

      const result = await passwordHasher.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });

    test('should handle empty password', async () => {
      const password = '';
      const hash = await passwordHasher.hash(password);

      const result = await passwordHasher.compare(password, hash);

      expect(result).toBe(true);
    });
  });
});
