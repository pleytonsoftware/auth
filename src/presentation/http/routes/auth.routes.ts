import { AuthController } from '../controllers/auth-controller';
import { IAuthService } from '../../../domain/services/auth-service.interface';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

export function createAuthRoutes(
  authController: AuthController,
  authService: IAuthService
) {
  return {
    async handleRequest(req: Request): Promise<Response> {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      // Public routes
      if (path === '/auth/register' && method === 'POST') {
        return authController.register(req);
      }

      if (path === '/auth/login' && method === 'POST') {
        return authController.login(req);
      }

      if (path === '/auth/oauth/callback' && method === 'POST') {
        return authController.oauthCallback(req);
      }

      if (path === '/auth/refresh' && method === 'POST') {
        return authController.refresh(req);
      }

      if (path === '/auth/logout' && method === 'POST') {
        return authController.logout(req);
      }

      // Protected routes
      if (path === '/auth/me' && method === 'GET') {
        const authReq = req as AuthRequest;
        const authError = await authMiddleware(authReq, authService);
        if (authError) return authError;
        return authController.me(authReq);
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };
}
