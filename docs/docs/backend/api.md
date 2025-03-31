---
sidebar_position: 2
---

# API Endpoints

BaseBuild provides a RESTful API for interacting with the backend services. This document outlines the available endpoints and their usage.

## Authentication Endpoints

### Register User

**Endpoint:** `POST /api/auth/register/`

**Description:** Creates a new user account with basic information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password1": "securepassword",
  "password2": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Register with Payment

**Endpoint:** `POST /api/auth/register/`

**Description:** Creates a new user account with payment information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password1": "securepassword",
  "password2": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "payment_method_id": "pm_card_visa",
  "productId": 1,
  "tierId": 2,
  "priceId": 3,
  "discountCode": {"code": "WELCOME10"},
  "trialDays": 14
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login

**Endpoint:** `POST /api/auth/login/`

**Description:** Authenticates a user and returns JWT tokens.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Refresh Token

**Endpoint:** `POST /api/auth/refresh/`

**Description:** Refreshes an access token using a refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## User Endpoints

### Get Current User

**Endpoint:** `GET /api/users/me/`

**Description:** Retrieves the current authenticated user's profile.

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "preferred_name": "Johnny",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com"
}
```

### Update User Profile

**Endpoint:** `PATCH /api/users/me/`

**Description:** Updates the current user's profile information.

**Request Body:**
```json
{
  "preferred_name": "Johnny",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "user@example.com",
  "preferred_name": "Johnny",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com"
}
```

## Product Endpoints

### List Products

**Endpoint:** `GET /api/products/`

**Description:** Retrieves a list of available products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Basic Plan",
    "description": "Basic features for individuals",
    "is_active": true,
    "tiers": [
      {
        "id": 1,
        "name": "Monthly",
        "prices": [
          {
            "id": 1,
            "billing_cycle": "monthly",
            "price": "9.99"
          },
          {
            "id": 2,
            "billing_cycle": "yearly",
            "price": "99.99"
          }
        ],
        "features": ["Feature 1", "Feature 2"],
        "order": 1
      }
    ],
    "trial_days": 14
  }
]
```

### Get Product

**Endpoint:** `GET /api/products/{id}/`

**Description:** Retrieves details for a specific product.

**Response:**
```json
{
  "id": 1,
  "name": "Basic Plan",
  "description": "Basic features for individuals",
  "is_active": true,
  "tiers": [
    {
      "id": 1,
      "name": "Monthly",
      "prices": [
        {
          "id": 1,
          "billing_cycle": "monthly",
          "price": "9.99"
        },
        {
          "id": 2,
          "billing_cycle": "yearly",
          "price": "99.99"
        }
      ],
      "features": ["Feature 1", "Feature 2"],
      "order": 1
    }
  ],
  "trial_days": 14
}
```

## Discount Code Endpoints

### Validate Discount Code

**Endpoint:** `POST /api/discount-codes/validate/`

**Description:** Validates a discount code and returns its details.

**Request Body:**
```json
{
  "code": "WELCOME10",
  "product_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "code": "WELCOME10",
  "discount_type": "percentage",
  "percentage": 10,
  "amount": null,
  "duration": "once",
  "duration_in_months": null,
  "trial_days": null,
  "product": 1,
  "is_active": true
}
```

## Authentication

All endpoints except for registration and login require authentication. To authenticate requests, include the JWT access token in the Authorization header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:

```json
{
  "detail": "Error message"
}
```

Or for validation errors:

```json
{
  "field_name": ["Error message"]
}
```

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- Anonymous requests: 20 requests per minute
- Authenticated requests: 60 requests per minute

When a rate limit is exceeded, the API will return a 429 Too Many Requests response.
