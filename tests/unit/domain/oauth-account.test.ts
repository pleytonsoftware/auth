import { describe, test, expect } from 'bun:test';
import { OAuthAccount } from '../../../src/domain/entities/oauth-account';

describe('OAuthAccount Entity', () => {
  describe('create', () => {
    test('should create a new OAuth account with null tokens', () => {
      const account = OAuthAccount.create(
        '01HQABC123',
        '01HQXYZ123',
        'google',
        'google-user-id-123'
      );

      expect(account.id).toBe('01HQABC123');
      expect(account.userId).toBe('01HQXYZ123');
      expect(account.provider).toBe('google');
      expect(account.providerAccountId).toBe('google-user-id-123');
      expect(account.accessToken).toBeNull();
      expect(account.refreshToken).toBeNull();
      expect(account.expiresAt).toBeNull();
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    test('should create a new OAuth account with tokens', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const account = OAuthAccount.create(
        '01HQABC123',
        '01HQXYZ123',
        'github',
        'github-user-id-456',
        'access-token-123',
        'refresh-token-456',
        expiresAt
      );

      expect(account.accessToken).toBe('access-token-123');
      expect(account.refreshToken).toBe('refresh-token-456');
      expect(account.expiresAt).toBe(expiresAt);
    });
  });

  describe('updateTokens', () => {
    test('should update all tokens', () => {
      const account = OAuthAccount.create(
        '01HQABC123',
        '01HQXYZ123',
        'google',
        'google-user-id-123'
      );

      const newExpiresAt = new Date(Date.now() + 7200000);
      account.updateTokens(
        'new-access-token',
        'new-refresh-token',
        newExpiresAt
      );

      expect(account.accessToken).toBe('new-access-token');
      expect(account.refreshToken).toBe('new-refresh-token');
      expect(account.expiresAt).toBe(newExpiresAt);
    });

    test('should update updatedAt timestamp', () => {
      const account = OAuthAccount.create(
        '01HQABC123',
        '01HQXYZ123',
        'google',
        'google-user-id-123'
      );

      const originalUpdatedAt = account.updatedAt;
      
      setTimeout(() => {
        account.updateTokens('new-token', null, null);
        expect(account.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });
});
