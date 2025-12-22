---
sidebar_position: 1
---

# Django API Overview

The BaseBuild backend is built with Django and provides a RESTful API for all frontend applications. It handles user authentication, data storage, and business logic processing.

## Technology Stack

- **Django**: Python web framework
- **Django REST Framework**: For building RESTful APIs
- **PostgreSQL**: Database for data storage
- **Celery**: For asynchronous task processing

## Project Structure

The backend code is organized in the `django` directory with the following structure:

```
django/
├── account/            # User account management
│   ├── management/     # Custom management commands
│   ├── migrations/     # Database migrations
│   └── templatetags/   # Custom template tags
├── api/                # API endpoints and serializers
│   ├── views/          # API view functions
│   ├── serializers.py  # Data serializers
│   └── urls.py         # API URL routing
├── config/             # Project configuration
│   ├── settings.py     # Django settings
│   ├── urls.py         # Root URL configuration
│   └── wsgi.py         # WSGI configuration
├── experiment/         # Experiment/feature flag management
├── tests/              # Test suite
│   └── api/            # API tests
├── manage.py           # Django management script
└── requirements.txt    # Python dependencies
```

## Key Components

### Authentication System

Handles user registration, login, email verification, and session management. Supports:

- Email/password registration
- Email verification with OTP codes
- JWT-based authentication
- Password reset flow
- "Remember me" functionality with extended token lifetime

### API Endpoints

The API follows RESTful principles and is organized by resource type:

| Endpoint | Description |
|----------|-------------|
| `/api/auth/sign-up` | User registration |
| `/api/auth/login` | User login |
| `/api/auth/logout` | User logout |
| `/api/auth/verify` | Email verification |
| `/api/auth/resend-verify` | Resend verification email |
| `/api/auth/password/reset` | Request password reset |
| `/api/auth/password/reset/confirm` | Confirm password reset |
| `/api/auth/token/refresh` | Refresh JWT token |
| `/api/users/me` | Current user info |
| `/api/users/change-password` | Change password |

### Data Models

- **User**: Extended Django user model with email verification
- **Product**: Product definitions with pricing tiers
- **Subscription**: User subscription management

### Background Tasks

Celery tasks for asynchronous processing:

- Email sending (verification, password reset)
- Scheduled maintenance tasks
- Long-running data processing

## Getting Started

To start working with the backend code:

1. Make sure you have Python 3.8+ installed
2. Navigate to the `django` directory
3. Create and activate a virtual environment
4. Install dependencies with `pip install -r requirements.txt`
5. Run migrations with `python manage.py migrate`
6. Start the development server with `python manage.py runserver`

The API will be available at http://localhost:8000/api/.

## Testing

The backend uses Django's built-in test framework:

```bash
# Run all tests
python manage.py test

# Run specific test module
python manage.py test tests.api.auth

# Using the bb CLI
bb test django
```

## API Documentation

API documentation is available at http://localhost:8000/api/docs/ when running the development server.
