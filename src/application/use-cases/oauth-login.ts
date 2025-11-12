import { ulid } from 'ulidx';
import { User } from '../../domain/entities/user';
import { OAuthAccount } from '../../domain/entities/oauth-account';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IOAuthAccountRepository } from '../../domain/repositories/oauth-account-repository.interface';
import { IAuthService } from '../../domain/services/auth-service.interface';
import { OAuthLoginDto, AuthResponseDto, UserResponseDto } from '../dto/auth.dto';

export class OAuthLogin {
  constructor(
    private userRepository: IUserRepository,
    private oauthAccountRepository: IOAuthAccountRepository,
    private authService: IAuthService
  ) {}

  async execute(dto: OAuthLoginDto): Promise<AuthResponseDto> {
    // Check if OAuth account exists
    let oauthAccount = await this.oauthAccountRepository.findByProviderAndAccountId(
      dto.provider,
      dto.providerAccountId
    );

    let user: User;

    if (oauthAccount) {
      // OAuth account exists, get the user
      user = await this.userRepository.findById(oauthAccount.userId);
      if (!user) {
        throw new Error('User not found for OAuth account');
      }

      // Update tokens if provided
      if (dto.accessToken || dto.refreshToken || dto.expiresAt) {
        oauthAccount.updateTokens(
          dto.accessToken || oauthAccount.accessToken,
          dto.refreshToken || oauthAccount.refreshToken,
          dto.expiresAt || oauthAccount.expiresAt
        );
        await this.oauthAccountRepository.update(oauthAccount);
      }
    } else {
      // Check if user exists with this email
      user = await this.userRepository.findByEmail(dto.email);

      if (!user) {
        // Create new user
        user = User.create(
          ulid(),
          dto.email,
          '', // No password for OAuth users
          dto.firstName,
          dto.lastName
        );
        user.verifyEmail(); // OAuth users are email verified
        user = await this.userRepository.create(user);
      }

      // Create OAuth account
      oauthAccount = OAuthAccount.create(
        ulid(),
        user.id,
        dto.provider,
        dto.providerAccountId,
        dto.accessToken,
        dto.refreshToken,
        dto.expiresAt
      );
      await this.oauthAccountRepository.create(oauthAccount);
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
