# Authentication API Documentation

## Overview

This API provides a complete multi-tenant authentication system with JWT (JSON Web Tokens). It supports:
- Email/Password authentication with bcrypt hashing
- JWT access tokens (1 hour expiry) and refresh tokens (7 days expiry)
- Multi-tenant support (users can belong to multiple organizations)
- Role-based access control (owner, admin, member)
- Google OAuth ready (passport configured)

## Authentication Flow

1. **Register** or **Login** → Receive access token + refresh token
2. **Select Tenant** (if user belongs to multiple) → Receive new access token with tenantId
3. **Make authenticated requests** → Include `Authorization: Bearer <token>` header
4. **Refresh token** before expiry → Get new access token

## Base URL

```
http://localhost:3001/api/auth
```

---

## Endpoints

### 1. Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Validation:**
- Email: Required, unique
- Password: Required, minimum 6 characters
- Full name: Required

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "email_verified": false,
    "created_date": "2025-11-12T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields or password too short
- `400 Bad Request`: Email already registered (code: 23505)

---

### 2. Login

Authenticate with email and password.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "email_verified": false,
    "is_active": true
  },
  "tenants": [
    {
      "id": "tenant-uuid",
      "name": "My Organization",
      "slug": "my-org",
      "role": "owner"
    }
  ],
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- If user belongs to only 1 tenant, it's automatically selected (tenantId included in access token)
- If user belongs to multiple tenants, call `/select-tenant` to choose one
- Updates `last_login` timestamp

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: User account is deactivated

---

### 3. Get Current User

Get authenticated user data and tenants.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "email_verified": false,
    "last_login": "2025-11-12T10:30:00Z",
    "created_date": "2025-11-12T10:00:00Z"
  },
  "tenants": [
    {
      "id": "tenant-uuid",
      "name": "My Organization",
      "slug": "my-org",
      "plan": "pro",
      "status": "active",
      "role": "owner"
    }
  ],
  "currentTenantId": "tenant-uuid"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

---

### 4. Refresh Access Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Refresh token not provided
- `401 Unauthorized`: Invalid or expired refresh token
- `401 Unauthorized`: User not found or inactive

---

### 5. Select Tenant

Switch to a different tenant (for users with multiple organizations).

**Endpoint:** `POST /api/auth/select-tenant`

**Request Body:**
```json
{
  "userId": "user-uuid",
  "tenantId": "tenant-uuid"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "id": "tenant-uuid",
    "name": "My Organization",
    "slug": "my-org",
    "role": "admin"
  }
}
```

**Notes:**
- Returns new access token with selected `tenantId`
- Use this token for tenant-specific operations

**Error Responses:**
- `400 Bad Request`: Missing userId or tenantId
- `403 Forbidden`: User doesn't have access to this tenant

---

### 6. Logout

Invalidate refresh token (logout).

**Endpoint:** `POST /api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Notes:**
- Deletes refresh token from database
- Access token continues working until expiry (1 hour)

---

## JWT Payload Structure

### Access Token Payload:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "iat": 1699876543,
  "exp": 1699880143
}
```

### Refresh Token Payload:
```json
{
  "userId": "user-uuid",
  "iat": 1699876543,
  "exp": 1700481343
}
```

---

## Authentication Middleware

### `authenticate`
Requires valid JWT token. Adds `req.user` to request:

```javascript
req.user = {
  userId: "uuid",
  email: "user@example.com",
  tenantId: "tenant-uuid" // null if not selected
}
```

**Usage:**
```javascript
router.get('/protected', authenticate, (req, res) => {
  const { userId, tenantId } = req.user;
  // Handle authenticated request
});
```

### `optionalAuthenticate`
Same as `authenticate` but doesn't block unauthenticated requests.

### `requireTenant`
Ensures user has selected a tenant (tenantId must be present).

**Usage:**
```javascript
router.get('/tenant-data', authenticate, requireTenant, (req, res) => {
  const { tenantId } = req.user;
  // tenantId is guaranteed to exist
});
```

---

## Environment Variables

Configure these in your environment:

```bash
# JWT Secrets (IMPORTANT: Change in production!)
JWT_SECRET=your-very-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Rotate Secrets**: Change JWT secrets regularly
3. **Token Storage**: 
   - Store access token in memory (React state)
   - Store refresh token in httpOnly cookie (recommended) or localStorage
4. **Password Policy**: Enforce strong passwords (min 8+ chars, uppercase, numbers, symbols)
5. **Rate Limiting**: Implement rate limiting on login/register endpoints
6. **CORS**: Configure CORS properly for your domain

---

## Google OAuth Integration

The system is ready for Google OAuth. To enable:

1. Set up Google OAuth credentials in Google Console
2. Configure environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```

3. Implement passport Google OAuth strategy (code ready in dependencies)

---

## Testing Examples

### Register and Login Flow
```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Get user data (use token from login)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

## Error Handling

All endpoints follow consistent error format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
