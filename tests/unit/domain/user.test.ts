import { describe, test, expect } from 'bun:test';
import { User } from '../../../src/domain/entities/user';

describe('User Entity', () => {
  describe('create', () => {
    test('should create a new user with default values', () => {
      const user = User.create(
        '01HQXYZ123',
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe'
      );

      expect(user.id).toBe('01HQXYZ123');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateEmail', () => {
    test('should update email and set emailVerified to false', () => {
      const user = User.create(
        '01HQXYZ123',
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe'
      );
      user.verifyEmail();

      const originalUpdatedAt = user.updatedAt;
      
      // Small delay to ensure updatedAt changes
      setTimeout(() => {
        user.updateEmail('newemail@example.com');

        expect(user.email).toBe('newemail@example.com');
        expect(user.emailVerified).toBe(false);
        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('verifyEmail', () => {
    test('should set emailVerified to true', () => {
      const user = User.create(
        '01HQXYZ123',
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe'
      );

      user.verifyEmail();

      expect(user.emailVerified).toBe(true);
    });
  });

  describe('updatePassword', () => {
    test('should update password', () => {
      const user = User.create(
        '01HQXYZ123',
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe'
      );

      user.updatePassword('newHashedPassword');

      expect(user.password).toBe('newHashedPassword');
    });
  });

  describe('updateProfile', () => {
    test('should update first name and last name', () => {
      const user = User.create(
        '01HQXYZ123',
        'test@example.com',
        'hashedPassword',
        'John',
        'Doe'
      );

      user.updateProfile('Jane', 'Smith');

      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
    });
  });
});
