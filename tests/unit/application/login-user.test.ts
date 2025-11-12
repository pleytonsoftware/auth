import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { LoginUser } from '../../../src/application/use-cases/login-user';
import { User } from '../../../src/domain/entities/user';

describe('LoginUser Use Case', () => {
  let mockUserRepository: any;
  let mockAuthService: any;
  let mockPasswordHasher: any;
  let loginUser: LoginUser;

  beforeEach(() => {
    const testUser = User.create(
      '01HQXYZ123',
      'test@example.com',
      'hashed-password',
      'John',
      'Doe'
    );

    mockUserRepository = {
      findByEmail: mock(() => Promise.resolve(testUser)),
    };

    mockAuthService = {
      generateAccessToken: mock(() => 'access-token-123'),
      generateRefreshToken: mock(() => 'refresh-token-456'),
    };

    mockPasswordHasher = {
      compare: mock(() => Promise.resolve(true)),
    };

    loginUser = new LoginUser(
      mockUserRepository,
      mockAuthService,
      mockPasswordHasher
    );
  });

  test('should login user successfully with valid credentials', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'SecurePass123',
    };

    const result = await loginUser.execute(dto);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe(dto.email);
    
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalled();
  });

  test('should throw error if user not found', async () => {
    mockUserRepository.findByEmail = mock(() => Promise.resolve(null));

    const dto = {
      email: 'nonexistent@example.com',
      password: 'SecurePass123',
    };

    await expect(loginUser.execute(dto)).rejects.toThrow('Invalid credentials');
  });

  test('should throw error if password is invalid', async () => {
    mockPasswordHasher.compare = mock(() => Promise.resolve(false));

    const dto = {
      email: 'test@example.com',
      password: 'WrongPassword123',
    };

    await expect(loginUser.execute(dto)).rejects.toThrow('Invalid credentials');
  });

  test('should generate both access and refresh tokens', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'SecurePass123',
    };

    const result = await loginUser.execute(dto);

    expect(mockAuthService.generateAccessToken).toHaveBeenCalled();
    expect(mockAuthService.generateRefreshToken).toHaveBeenCalled();
    expect(result.accessToken).toBe('access-token-123');
    expect(result.refreshToken).toBe('refresh-token-456');
  });
});
