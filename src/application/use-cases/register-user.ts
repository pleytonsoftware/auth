import { ulid } from 'ulidx';
import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IAuthService } from '../../domain/services/auth-service.interface';
import { RegisterUserDto, AuthResponseDto, UserResponseDto } from '../dto/auth.dto';

export class RegisterUser {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService,
    private passwordHasher: { hash(password: string): Promise<string> }
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // Create user
    const user = User.create(
      ulid(),
      dto.email,
      hashedPassword,
      dto.firstName,
      dto.lastName
    );

    // Save user
    const savedUser = await this.userRepository.create(user);

    // Generate tokens
    const accessToken = this.authService.generateAccessToken(savedUser.id);
    const refreshToken = this.authService.generateRefreshToken(savedUser.id);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(savedUser),
    };
  }

  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
