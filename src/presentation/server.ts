import { db } from '../infrastructure/database/connection';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { OAuthAccountRepository } from '../infrastructure/repositories/OAuthAccountRepository';
import { JwtService } from '../infrastructure/security/JwtService';
import { PasswordHasher } from '../infrastructure/security/PasswordHasher';
import { RegisterUser } from '../application/use-cases/RegisterUser';
import { LoginUser } from '../application/use-cases/LoginUser';
import { OAuthLogin } from '../application/use-cases/OAuthLogin';
import { RefreshToken } from '../application/use-cases/RefreshToken';
import { AuthController } from './http/controllers/AuthController';
import { createAuthRoutes } from './http/routes/auth.routes';

export function createServer() {
  // Initialize repositories
  const userRepository = new UserRepository(db);
  const oauthAccountRepository = new OAuthAccountRepository(db);

  // Initialize services
  const authService = new JwtService();
  const passwordHasher = new PasswordHasher();

  // Initialize use cases
  const registerUser = new RegisterUser(
    userRepository,
    authService,
    passwordHasher
  );
  const loginUser = new LoginUser(userRepository, authService, passwordHasher);
  const oauthLogin = new OAuthLogin(
    userRepository,
    oauthAccountRepository,
    authService
  );
  const refreshToken = new RefreshToken(userRepository, authService);

  // Initialize controller
  const authController = new AuthController(
    registerUser,
    loginUser,
    oauthLogin,
    refreshToken,
    userRepository
  );

  // Create routes
  const authRoutes = createAuthRoutes(authController, authService);

  // Create Bun server
  const server = Bun.serve({
    port: process.env.PORT || 3000,
    async fetch(req) {
      const url = new URL(req.url);

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Auth routes
      if (url.pathname.startsWith('/auth')) {
        return authRoutes.handleRequest(req);
      }

      // 404 for all other routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  console.log(`🚀 Server running on http://localhost:${server.port}`);
  return server;
}
