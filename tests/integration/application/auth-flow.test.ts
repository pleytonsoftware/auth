import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { User } from '../../../src/domain/entities/user';
import { RegisterUser } from '../../../src/application/use-cases/register-user';
import { LoginUser } from '../../../src/application/use-cases/login-user';
import { JwtService } from '../../../src/infrastructure/security/jwt-service';
import { PasswordHasher } from '../../../src/infrastructure/security/password-hasher';

// Mock repository for integration testing
class InMemoryUserRepository {
  private users: Map<string, User> = new Map();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  clear() {
    this.users.clear();
  }
}

describe('Authentication Integration Tests', () => {
  let userRepository: InMemoryUserRepository;
  let authService: JwtService;
  let passwordHasher: PasswordHasher;
  let registerUser: RegisterUser;
  let loginUser: LoginUser;

  beforeAll(() => {
    // Set up test environment
    process.env.JWT_SECRET = 'test-secret-integration';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-integration';
    
    userRepository = new InMemoryUserRepository();
    authService = new JwtService();
    passwordHasher = new PasswordHasher();
    
    registerUser = new RegisterUser(userRepository, authService, passwordHasher);
    loginUser = new LoginUser(userRepository, authService, passwordHasher);
  });

  afterAll(() => {
    userRepository.clear();
  });

  test('full registration and login flow', async () => {
    // Register a new user
    const registerDto = {
      email: 'integration@example.com',
      password: 'SecurePass123',
      firstName: 'Integration',
      lastName: 'Test',
    };

    const registerResult = await registerUser.execute(registerDto);

    expect(registerResult.user.email).toBe(registerDto.email);
    expect(registerResult.accessToken).toBeDefined();
    expect(registerResult.refreshToken).toBeDefined();

    // Verify tokens
    const accessPayload = authService.verifyAccessToken(registerResult.accessToken);
    expect(accessPayload).not.toBeNull();
    expect(accessPayload?.userId).toBe(registerResult.user.id);

    const refreshPayload = authService.verifyRefreshToken(registerResult.refreshToken);
    expect(refreshPayload).not.toBeNull();

    // Login with the same credentials
    const loginDto = {
      email: registerDto.email,
      password: registerDto.password,
    };

    const loginResult = await loginUser.execute(loginDto);

    expect(loginResult.user.email).toBe(registerDto.email);
    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.refreshToken).toBeDefined();
    expect(loginResult.user.id).toBe(registerResult.user.id);
  });

  test('should prevent duplicate registration', async () => {
    const registerDto = {
      email: 'duplicate@example.com',
      password: 'SecurePass123',
      firstName: 'Duplicate',
      lastName: 'Test',
    };

    // First registration should succeed
    await registerUser.execute(registerDto);

    // Second registration should fail
    await expect(registerUser.execute(registerDto)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  test('should fail login with wrong password', async () => {
    const registerDto = {
      email: 'wrongpass@example.com',
      password: 'CorrectPass123',
      firstName: 'Wrong',
      lastName: 'Pass',
    };

    await registerUser.execute(registerDto);

    const loginDto = {
      email: registerDto.email,
      password: 'WrongPassword123',
    };

    await expect(loginUser.execute(loginDto)).rejects.toThrow('Invalid credentials');
  });

  test('should fail login with non-existent email', async () => {
    const loginDto = {
      email: 'nonexistent@example.com',
      password: 'SomePassword123',
    };

    await expect(loginUser.execute(loginDto)).rejects.toThrow('Invalid credentials');
  });
});
