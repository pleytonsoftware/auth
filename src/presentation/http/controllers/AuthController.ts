import { RegisterUser } from '../../../application/use-cases/RegisterUser';
import { LoginUser } from '../../../application/use-cases/LoginUser';
import { OAuthLogin } from '../../../application/use-cases/OAuthLogin';
import { RefreshToken } from '../../../application/use-cases/RefreshToken';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import {
  RegisterUserDtoSchema,
  LoginUserDtoSchema,
  OAuthLoginDtoSchema,
  RefreshTokenDtoSchema,
} from '../../../application/dto/AuthDto';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  constructor(
    private registerUser: RegisterUser,
    private loginUser: LoginUser,
    private oauthLogin: OAuthLogin,
    private refreshToken: RefreshToken,
    private userRepository: IUserRepository
  ) {}

  async register(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = RegisterUserDtoSchema.parse(body);
      const result = await this.registerUser.execute(dto);

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = LoginUserDtoSchema.parse(body);
      const result = await this.loginUser.execute(dto);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async oauthCallback(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = OAuthLoginDtoSchema.parse(body);
      const result = await this.oauthLogin.execute(dto);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refresh(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const dto = RefreshTokenDtoSchema.parse(body);
      const result = await this.refreshToken.execute(dto);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async me(req: AuthRequest): Promise<Response> {
    try {
      if (!req.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const user = await this.userRepository.findById(req.userId);
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(req: Request): Promise<Response> {
    // In a stateless JWT implementation, logout is typically handled client-side
    // by removing the token. For a more sophisticated implementation,
    // you could maintain a token blacklist.
    return new Response(
      JSON.stringify({ message: 'Logged out successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private handleError(error: unknown): Response {
    console.error('Error:', error);

    if (error instanceof Error) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        return new Response(
          JSON.stringify({
            error: 'Validation error',
            details: error.message,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Handle known errors
      if (
        error.message.includes('already exists') ||
        error.message.includes('Invalid credentials')
      ) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (error.message.includes('not found')) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('token')) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
