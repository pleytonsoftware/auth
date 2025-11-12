import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { RegisterUser } from '../../../src/application/use-cases/register-user';
import { User } from '../../../src/domain/entities/user';

describe('RegisterUser Use Case', () => {
  let mockUserRepository: any;
  let mockAuthService: any;
  let mockPasswordHasher: any;
  let registerUser: RegisterUser;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: mock(() => Promise.resolve(null)),
      create: mock((user: User) => Promise.resolve(user)),
    };

    mockAuthService = {
      generateAccessToken: mock(() => 'access-token-123'),
      generateRefreshToken: mock(() => 'refresh-token-456'),
    };

    mockPasswordHasher = {
      hash: mock(() => Promise.resolve('hashed-password')),
    };

    registerUser = new RegisterUser(
      mockUserRepository,
      mockAuthService,
      mockPasswordHasher
    );
  });

  test('should register a new user successfully', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await registerUser.execute(dto);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe(dto.email);
    expect(result.user.firstName).toBe(dto.firstName);
    expect(result.user.lastName).toBe(dto.lastName);
    expect(result.user.emailVerified).toBe(false);
    
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockAuthService.generateAccessToken).toHaveBeenCalled();
    expect(mockAuthService.generateRefreshToken).toHaveBeenCalled();
  });

  test('should throw error if user already exists', async () => {
    const existingUser = User.create(
      '01EXISTING',
      'test@example.com',
      'hashed',
      'Existing',
      'User'
    );
    
    mockUserRepository.findByEmail = mock(() => Promise.resolve(existingUser));

    const dto = {
      email: 'test@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
    };

    await expect(registerUser.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  test('should hash the password before storing', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'PlainPassword123',
      firstName: 'John',
      lastName: 'Doe',
    };

    await registerUser.execute(dto);

    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('PlainPassword123');
  });
});
