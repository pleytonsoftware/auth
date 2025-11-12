import { z } from 'zod';

export const RegisterUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type RegisterUserDto = z.infer<typeof RegisterUserDtoSchema>;

export const LoginUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginUserDto = z.infer<typeof LoginUserDtoSchema>;

export const OAuthLoginDtoSchema = z.object({
  provider: z.string(),
  providerAccountId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
});

export type OAuthLoginDto = z.infer<typeof OAuthLoginDtoSchema>;

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: Date;
}
