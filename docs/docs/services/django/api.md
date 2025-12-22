---
sidebar_position: 2
---

# API Reference

This document provides detailed information about the Django REST API endpoints.

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth/`.

### Sign Up

**POST** `/api/auth/sign-up`

Creates a new user account and sends a verification email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_verified": false
}
```

### Login

**POST** `/api/auth/login`

Authenticates a user and returns JWT tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "remember_me": false
}
```

**Response (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_verified": true
  }
}
```

### Logout

**POST** `/api/auth/logout`

Invalidates the current refresh token.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Verify Email

**POST** `/api/auth/verify`

Verifies a user's email address using the OTP code.

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Resend Verification

**POST** `/api/auth/resend-verify`

Resends the verification email with a new OTP code.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### Password Reset Request

**POST** `/api/auth/password/reset`

Sends a password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### Password Reset Confirm

**POST** `/api/auth/password/reset/confirm`

Resets the password using the token from the email.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "newpassword"
}
```

### Token Refresh

**POST** `/api/auth/token/refresh`

Refreshes an expired access token.

**Request Body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## User Endpoints

All user endpoints require authentication and are prefixed with `/api/users/`.

### Get Current User

**GET** `/api/users/me`

Returns the authenticated user's information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_verified": true,
  "date_joined": "2024-01-15T10:30:00Z"
}
```

### Change Password

**POST** `/api/users/change-password`

Changes the authenticated user's password.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**

```json
{
  "error": "Validation error message",
  "details": {
    "field_name": ["Error message for this field"]
  }
}
```

**401 Unauthorized:**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**

```json
{
  "detail": "Not found."
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Default limits:

- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```
