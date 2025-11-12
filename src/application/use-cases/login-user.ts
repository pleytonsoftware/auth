import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IAuthService } from '../../domain/services/auth-service.interface';
import { LoginUserDto, AuthResponseDto, UserResponseDto } from '../dto/auth.dto';
import { User } from '../../domain/entities/user';

export class LoginUser {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService,
    private passwordHasher: { compare(password: string, hash: string): Promise<boolean> }
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.authService.generateAccessToken(user.id);
    const refreshToken = this.authService.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
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
