---
sidebar_position: 1
---

# Environment Variables

This document lists all environment variables used by BaseBuild services. Variables marked as **Required** must be set for the service to function properly.

## Django API

Environment files:
- `django/.env.dev` - Development defaults
- `django/.env.secrets` - Sensitive values (gitignored)

### Core Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEBUG` | No | `1` | Enable debug mode (set to `0` in production) |
| `SECRET_KEY` | **Yes** | `'secret'` | Django secret key for cryptographic signing |
| `DJANGO_ALLOWED_HOSTS` | **Yes** | `localhost 127.0.0.1 [::1]` | Space-separated list of allowed hosts |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SQL_ENGINE` | No | `django.db.backends.postgresql` | Database engine |
| `SQL_DATABASE` | **Yes** | `db_dev` | Database name |
| `SQL_USER` | **Yes** | `admin` | Database user |
| `SQL_PASSWORD` | **Yes** | `admin` | Database password |
| `SQL_HOST` | **Yes** | `db` | Database host |
| `SQL_PORT` | No | `5432` | Database port |
| `DATABASE` | No | `postgres` | Database type identifier |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OTP_EXPIRATION_MINUTES` | No | `15` | OTP code expiration time in minutes |
| `REMEMBER_ME_TOKEN_LIFETIME_DAYS` | No | `30` | Extended token lifetime for "remember me" |

### Frontend Integration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FRONTEND_URL` | **Yes** | `http://localhost:3001` | Frontend URL for CORS and email links |

### Celery (Background Tasks)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CELERY_TASK_RATE_LIMIT` | No | `5` | Task rate limit per second |
| `CELERY_WORKER_CONCURRENCY` | No | `1` | Number of worker processes |
| `CELERY_PREFETCH_MULTIPLIER` | No | `1` | Tasks to prefetch per worker |

### External Services

These should be set in `django/.env.secrets`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTMARK_API_SERVICE_KEY` | No* | `0` | Postmark API key for email sending |
| `DEFAULT_FROM_EMAIL` | No | `system@example.com` | Default sender email address |
| `OWNER_EMAIL` | No | - | Owner notification email |
| `STRIPE_SECRET_KEY` | No* | `0` | Stripe secret key for payments |
| `STRIPE_PUBLISHABLE_KEY` | No* | - | Stripe publishable key |
| `PAYMENT_REQUIRED` | No | `False` | Enable payment requirement for registration |

*Required if you're using the corresponding feature (email/payments).

---

## Next.js

Environment file: `next/.env.local` (create from example)

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | `http://localhost:8009` | Django API base URL |
| `NEXT_PUBLIC_APP_VERSION` | No | `0.1.0` | Application version |
| `NODE_ENV` | No | `development` | Node environment |

### Example `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8009
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## React

Environment file: `react/.env.dev`

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | **Yes** | - | Django API base URL |

### Example

```bash
VITE_API_BASE_URL=http://localhost:8009
```

---

## Mobile (React Native / Expo)

Environment is typically configured in `app.json` or through Expo's environment handling.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | **Yes** | - | Django API base URL |

---

## Docker Compose

The `docker-compose.yml` file uses these environment variables or reads from `.env` files:

### Database Container

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | **Yes** | `admin` | PostgreSQL superuser |
| `POSTGRES_PASSWORD` | **Yes** | `admin` | PostgreSQL password |
| `POSTGRES_DB` | **Yes** | `db_dev` | Default database name |

### Redis (if enabled)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | **Yes** | `redis://broker:6379/0` | Redis connection URL |

---

## Production Environment

For production deployments, ensure these are set securely:

### Critical Security Variables

| Variable | Notes |
|----------|-------|
| `SECRET_KEY` | Generate a strong random key (50+ characters) |
| `DEBUG` | Must be `0` or `False` |
| `DJANGO_ALLOWED_HOSTS` | Set to your actual domain(s) |
| `SQL_PASSWORD` | Use a strong, unique password |
| `STRIPE_SECRET_KEY` | Use production Stripe key (starts with `sk_live_`) |

### Generating a Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Or:

```bash
openssl rand -base64 50
```

---

## Environment File Templates

### django/.env.secrets (Template)

```bash
# Email Service
POSTMARK_API_SERVICE_KEY=your-postmark-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
OWNER_EMAIL=admin@yourdomain.com

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYMENT_REQUIRED=False
```

### next/.env.local (Template)

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8009
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Troubleshooting

### Variables Not Loading

1. **Django**: Check that `.env.dev` and `.env.secrets` are in the `django/` directory
2. **Next.js**: Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
3. **React/Vite**: Ensure variables are prefixed with `VITE_`

### Docker Environment

Variables in `docker-compose.yml` override those in `.env` files. Check both locations.

### Debugging

```bash
# Django - print loaded settings
python manage.py shell -c "from django.conf import settings; print(settings.SECRET_KEY)"

# Next.js - check in browser console
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
```
