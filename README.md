# Authentication Microservice

A production-ready authentication microservice built with Bun, implementing hexagonal (clean) architecture with support for email/password authentication and OAuth providers.

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles with clear separation of concerns:

```
src/
├── domain/           # Business logic and entities (framework-independent)
│   ├── entities/     # Domain models (User, OAuthAccount)
│   ├── repositories/ # Repository interfaces
│   └── services/     # Service interfaces
├── application/      # Use cases and DTOs
│   ├── use-cases/    # Business operations
│   └── dto/          # Data transfer objects
├── infrastructure/   # External concerns (databases, security)
│   ├── database/     # Database schema and connection
│   ├── repositories/ # Repository implementations
│   └── security/     # JWT and password hashing
└── presentation/     # HTTP layer (controllers, routes, middleware)
```

## ✨ Features

- **Email/Password Authentication**: Register and login with email and password
- **OAuth Support**: Integrate with any OAuth provider (Google, GitHub, etc.)
- **JWT Tokens**: Secure token-based authentication with refresh tokens
- **Password Hashing**: Bcrypt with 10 rounds for secure password storage
- **User Management**: Complete user CRUD operations
- **TypeScript**: Fully typed with strict mode enabled
- **ULID**: Unique, sortable identifiers instead of UUIDs
- **Database Migrations**: Drizzle ORM with migration support
- **SOLID Principles**: Clean, maintainable, and testable code

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- PostgreSQL database running

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pleytonsoftware/auth.git
cd auth
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=auth_db

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=7d
```

4. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE auth_db;"
```

5. Generate and run migrations:
```bash
bun run db:generate
bun run db:migrate
```

6. Start the server:
```bash
bun run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

#### Register User
```http
POST /auth/register
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "01HQXYZ...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "01HQXYZ...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### OAuth Callback
```http
POST /auth/oauth/callback
```
**Request Body:**
```json
{
  "provider": "google",
  "providerAccountId": "google-user-id-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "oauth-access-token",
  "refreshToken": "oauth-refresh-token",
  "expiresAt": "2024-01-01T01:00:00.000Z"
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "01HQXYZ...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```
**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "01HQXYZ...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access-token>
```
**Response (200):**
```json
{
  "id": "01HQXYZ...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Logout
```http
POST /auth/logout
```
**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```
*Note: With JWT, logout is typically handled client-side by removing tokens.*

## 🔐 OAuth Integration Guide

This microservice supports OAuth authentication. Here's how to integrate different providers:

### Google OAuth

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
3. Implement OAuth flow in your client application
4. After receiving OAuth token from Google, call the `/auth/oauth/callback` endpoint

### GitHub OAuth

1. Create OAuth app in [GitHub Settings](https://github.com/settings/developers)
2. Add credentials to `.env`:
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```
3. Implement OAuth flow in your client application
4. After receiving OAuth token from GitHub, call the `/auth/oauth/callback` endpoint

### Generic OAuth Flow

1. User clicks "Login with [Provider]" in your client
2. Redirect user to provider's OAuth authorization URL
3. Provider redirects back with authorization code
4. Exchange code for access token (client-side or server-side)
5. Send OAuth data to `/auth/oauth/callback`:
```javascript
const response = await fetch('http://localhost:3000/auth/oauth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google',
    providerAccountId: userData.id,
    email: userData.email,
    firstName: userData.given_name,
    lastName: userData.family_name,
    accessToken: oauthAccessToken,
    refreshToken: oauthRefreshToken,
  })
});
```
6. Receive JWT tokens and user data
7. Store tokens in your client application

## 🗄️ Database Migrations

### Generate Migration
After modifying the schema in `src/infrastructure/database/schema.ts`:
```bash
bun run db:generate
```

### Run Migrations
```bash
bun run db:migrate
```

### Push Schema (Development)
For rapid development, push schema changes directly:
```bash
bun run db:push
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `auth_db` |
| `JWT_SECRET` | JWT access token secret | Required |
| `JWT_EXPIRATION` | Access token expiration | `15m` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Optional |

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: Separate access and refresh tokens with configurable expiration
- **Environment-based Secrets**: All secrets stored in environment variables
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **CORS**: Configure as needed for your frontend
- **Type Safety**: TypeScript strict mode for compile-time safety

## 🏃 Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database

## 🧪 Testing

To test the API, you can use curl, Postman, or any HTTP client:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'

# Get current user (replace TOKEN with actual access token)
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 📦 Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **ID Generation**: ULID (ulidx)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.