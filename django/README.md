# Environment Variables

## Required

SECRET_KEY
Django secret key for the application.

DJANGO_ALLOWED_HOSTS
Comma separated list of allowed hosts.

SQL_ENGINE
Database engine to use. Default is `django.db.backends.sqlite3`.

SQL_DATABASE
Database name. Default is "db.sqlite3".

SQL_USER
Database user. Default is "user".

SQL_PASSWORD
Database password. Default is "password".

SQL_HOST
Database host. Default is "localhost".

SQL_PORT
Database port. Default is "5432".

FRONTEND_URL
URL of the frontend application. Required for Emails with link to app.

OTP_EXPIRATION_MINUTES
Number of minutes before an OTP expires. Default is 5.

DEFAULT_FROM_EMAIL
The email address to send emails from. Default is "no-reply@test.io".

POSTMARK_API_SERVICE_KEY
API key for Postmark email service. Needed for environments without DEBUG=True.

CELERY_BROKER_URL
URL for the Celery broker. Default is "redis://broker:6379/0".

CELERY_RESULT_BACKEND
URL for the Celery result backend. Default is "redis://broker:6379/0".

CELERY_TASK_RATE_LIMIT
Rate limit for Celery tasks per minute. Default is 10.

CELERY_WORKER_CONCURRENCY
Number of concurrent workers for Celery. Default is 1 in dev and 0 (autoscaling) in production.

CELERY_PREFETCH_MULTIPLIER
Number of tasks to prefetch by each worker. Default is 1.

# Implementation

## Standard Response

### Custom Exception Handling (StandardException):

- The StandardException class encapsulates the error details (message, error_code, and status). This makes raising errors throughout your project much more consistent.
- By handling this exception in the handle_exception method, you ensure a standardized error response format without repeating logic across views.

### Consistent StandardResponse Formatting:

- The StandardResponse class ensures every response is formatted consistently, providing a clear structure that’s easy for the frontend to interpret.
- You’ve removed the unnecessary debug handling, which keeps the code clean. You can always add this back for development-specific use if needed.

### StandardMixin for Centralized Logic:

- The handle_exception and finalize_response methods in StandardMixin are perfectly placed for centralizing both error handling and response formatting.
- The way you use getattr() ensures that there is always a default fallback, which helps prevent unexpected errors in the formatting process.
- Differentiating between successful and error responses with message and error fields keeps the response intuitive.

### Extending with StandardViewSet and StandardAPIView:

- By creating StandardViewSet and StandardAPIView, you’re making it easy to apply these standardized patterns throughout your project simply by inheriting from these base classes.
- This approach not only makes your code DRY (Don’t Repeat Yourself) but also consistent across all your APIs.

# Example cURL commands

## Sign Up

curl -X POST http://localhost:8009/api/auth/sign-up \
-H "Content-Type: application/json" \
-d '{
"username": "jbwilkinson",
"email": "joe@wilkinsonventures.io",
"first_name": "Joseph",
"last_name": "Wilkinson",
"password1": "testpass123",
"password2": "testpass123"
}'
