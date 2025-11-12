import { db } from '../infrastructure/database/connection';
import { UserRepository } from '../infrastructure/repositories/user-repository';
import { OAuthAccountRepository } from '../infrastructure/repositories/oauth-account-repository';
import { JwtService } from '../infrastructure/security/jwt-service';
import { PasswordHasher } from '../infrastructure/security/password-hasher';
import { RegisterUser } from '../application/use-cases/register-user';
import { LoginUser } from '../application/use-cases/login-user';
import { OAuthLogin } from '../application/use-cases/oauth-login';
import { RefreshToken } from '../application/use-cases/refresh-token';
import { AuthController } from './http/controllers/auth-controller';
import { createAuthRoutes } from './http/routes/auth.routes';
import * as path from 'path';

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

      // Swagger UI
      if (url.pathname === '/api-docs' || url.pathname === '/api-docs/') {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auth API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // OpenAPI JSON spec
      if (url.pathname === '/openapi.json') {
        const openapiPath = path.join(process.cwd(), 'openapi.json');
        const file = Bun.file(openapiPath);
        const content = await file.text();
        return new Response(content, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

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
  console.log(`📚 API Documentation available at http://localhost:${server.port}/api-docs`);
  return server;
}
