import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IAuthService } from '../../domain/services/auth-service.interface';
import { RefreshTokenDto, AuthResponseDto, UserResponseDto } from '../dto/auth.dto';
import { User } from '../../domain/entities/user';

export class RefreshToken {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    // Verify refresh token
    const payload = this.authService.verifyRefreshToken(dto.refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
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
