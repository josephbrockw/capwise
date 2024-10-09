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
