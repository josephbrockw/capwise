# BaseBuild

A full-stack application template with Django, Next.js, React, and Docker.

---

## Built-In Features Summary

This section provides LLMs and developers with a comprehensive overview of what is already implemented. **Do not create tickets or plans for features listed here.**

### Authentication System (Complete)
- **User Registration** - Email/password signup with validation
- **Email Verification** - OTP-based email verification flow
- **Login/Logout** - JWT-based authentication with access/refresh tokens
- **Remember Me** - Extended token lifetime option
- **Password Reset** - Email-initiated password reset with OTP tokens
- **Password Change** - Authenticated password change endpoint
- **Token Refresh** - Automatic token refresh mechanism
- **Auth Context** - React context for auth state management

### User Management (Complete)
- **Custom User Model** - UUID primary key, email as unique identifier, preferred_name field
- **User Profile API** - GET/PATCH endpoints for user details
- **User Serializers** - Registration, login, and profile serializers

### Payment System (Complete - Stripe Integration)
- **Product Model** - Products with descriptions, active status, default trial days
- **Tier Model** - Product tiers with features (JSON), Stripe product IDs, ordering
- **Price Model** - Billing cycles (monthly/yearly/lifetime), Stripe price IDs
- **Subscription Model** - User subscriptions with status tracking, trial periods, cancellation
- **Discount Codes** - Percentage/fixed amount discounts, duration options, Stripe coupon sync
- **Payment Flow** - Optional payment during registration (configurable via PAYMENT_REQUIRED)
- **Discount Validation API** - Endpoint to check/apply discount codes

### A/B Testing / Experiments (Complete)
- **Experiment Model** - Named experiments with descriptions, active status
- **Variation Model** - Weighted variations with view/conversion tracking
- **Experiment API** - CRUD endpoints for experiments

### Background Tasks (Complete - Celery)
- **Celery Configuration** - Redis broker, beat scheduler
- **Scheduled Tasks** - OTP cleanup, experiment reports
- **Task Templates** - Example tasks with crontab and interval scheduling

### Email System (Complete)
- **Verification Emails** - Account verification with OTP
- **Password Reset Emails** - Secure password reset flow
- **Password Changed Notification** - Confirmation emails
- **Experiment Reports** - Scheduled experiment summary emails
- **Django Anymail Integration** - Production-ready email backend

### API Architecture (Complete)
- **StandardResponse** - Consistent response format with data/message/error fields
- **StandardViewSet** - Base viewset with centralized error handling
- **StandardAPIView** - Base API view with response formatting
- **JWT Authentication** - SimpleJWT with blacklisting support
- **CORS Configuration** - Django CORS headers setup
- **OpenAPI/Swagger** - DRF Spectacular integration

### Frontend Component Library (Complete)

#### UI Components (`next/src/components/bb/ui/`)
- **Button** - Primary, secondary, light, ghost variants; sizes; loading state
- **Input** - Text input with label, error states, icons
- **Select** - Dropdown select component
- **Checkbox** - Checkbox with label support
- **Toggle** - Toggle/switch component
- **Label** - Form labels
- **LinkButton** - Button-styled links

#### Layout Components (`next/src/components/bb/layout/`)
- **Container** - Max-width container with padding
- **Stack** - Vertical stacking with gap control
- **Flex** - Flexbox layout component
- **Divider** - Horizontal/vertical dividers

#### Navigation Components (`next/src/components/bb/navigation/`)
- **Navbar** - Top navigation bar
- **NavLink** - Navigation links with active states
- **Tabs** - Tab navigation component
- **Dropdown** - Dropdown menus
- **Breadcrumbs** - Breadcrumb navigation

#### Feedback Components (`next/src/components/bb/feedback/`)
- **Alert** - Info, success, warning, error alerts
- **Toast** - Toast notifications
- **Modal** - Modal dialogs
- **ConfirmDialog** - Confirmation dialogs
- **Spinner** - Loading spinner
- **Skeleton** - Loading skeletons

#### Data Display Components (`next/src/components/bb/data-display/`)
- **Table** - Data table component
- **Badge** - Status badges
- **Avatar** - User avatars
- **Progress** - Progress bars
- **EmptyState** - Empty state placeholders

#### Form Utilities (`next/src/components/bb/forms/`)
- **FormField** - Form field wrapper with validation
- **FormGroup** - Form grouping component
- **useForm** - Form state management hook

### Frontend Pages (Complete)
- **Home Page** (`/`) - Landing page
- **Login Page** (`/login`) - Login form with remember me
- **Register Page** (`/register`) - Registration form with validation
- **Verify Page** (`/verify`) - Email verification page
- **Dashboard** (`/dashboard`) - Authenticated user dashboard
- **Component Library** (`/component-library`) - Component showcase

### Frontend Infrastructure (Complete)
- **API Client** - Typed fetch wrapper with auth handling
- **Auth Utilities** - Token management, login/logout/register functions
- **Config System** - Centralized app configuration
- **Auth Context** - React context for authentication state
- **Error Boundaries** - Global and page-level error handling
- **404 Page** - Custom not found page

### Development Tooling (Complete)
- **BB CLI** - Custom CLI for common development tasks
- **Docker Compose** - Multi-service development environment
- **Code Quality** - Flake8, Black, isort configuration
- **Testing** - Django unittest, Vitest, Playwright E2E
- **GitHub Actions** - CI workflows for Django and Next.js tests

### Theming System (Complete)
- **CSS Variables** - Primary/secondary color palettes (50-950 shades)
- **Dark Mode** - Full dark mode support
- **Tailwind Integration** - Custom theme configuration

---

## API Endpoints Reference

All endpoints return standardized responses: `{ data, message, error }`.

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sign-up` | Register new user | No |
| POST | `/verify` | Verify email with OTP | No |
| POST | `/resend-verify` | Resend verification email | No |
| POST | `/login` | Login, returns JWT tokens | No |
| POST | `/logout` | Logout, blacklists refresh token | Yes |
| POST | `/token/refresh` | Refresh access token | No |
| POST | `/password/reset` | Initiate password reset | No |
| POST | `/password/reset/confirm` | Complete password reset | No |

### Users (`/api/users/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | Yes |
| PATCH | `/me` | Update current user profile | Yes |
| POST | `/change-password` | Change password | Yes |

### Products (`/api/products/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List active products with tiers/prices | No |

### Purchase (`/api/purchase/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/check-discount` | Validate discount code | No |

### Experiments (`/api/experiments/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List experiments | Yes |
| POST | `/` | Create experiment | Yes |
| GET | `/{id}/` | Get experiment details | Yes |
| PATCH | `/{id}/` | Update experiment | Yes |
| DELETE | `/{id}/` | Delete experiment | Yes |

---

## Database Models Reference

### account.User
```python
id: UUID (primary key)
username: CharField
email: EmailField (unique)
first_name: CharField
last_name: CharField
preferred_name: CharField
payment_method_id: CharField (nullable)
# Inherits from AbstractUser: password, is_active, is_staff, date_joined, etc.
```

### account.OneTimePassword
```python
id: UUID (primary key)
user: ForeignKey -> User
token: CharField (unique, indexed)
created: DateTimeField
expires: DateTimeField
is_active: BooleanField
```

### payment.Product
```python
id: AutoField (primary key)
name: CharField
description: TextField
is_active: BooleanField
default_trial_days: PositiveIntegerField
```

### payment.Tier
```python
id: AutoField (primary key)
name: CharField
product: ForeignKey -> Product
features: JSONField (nullable)
stripe_product_id: CharField
order: IntegerField
```

### payment.Price
```python
id: AutoField (primary key)
tier: ForeignKey -> Tier
billing_cycle: CharField (monthly/yearly/lifetime)
price: PositiveIntegerField (cents)
stripe_price_id: CharField
```

### payment.Subscription
```python
id: AutoField (primary key)
user: ForeignKey -> User
tier: ForeignKey -> Tier
price: ForeignKey -> Price (nullable)
stripe_customer_id: CharField
stripe_subscription_id: CharField
status: CharField (active/canceled/past_due/incomplete)
trial_end: DateField (nullable)
cancel_at_period_end: BooleanField
current_period_end: DateField (nullable)
created_at: DateTimeField
updated_at: DateTimeField
```

### payment.DiscountCode
```python
id: AutoField (primary key)
code: CharField (unique)
discount_type: CharField (percent_off/amount_off)
percentage: PositiveIntegerField (nullable)
amount: PositiveIntegerField (nullable)
duration: CharField (forever/once/repeating)
duration_in_months: PositiveIntegerField (nullable)
trial_days: PositiveIntegerField (nullable)
product: ForeignKey -> Product (nullable)
is_active: BooleanField
stripe_coupon_id: CharField (nullable)
created_at: DateTimeField
updated_at: DateTimeField
```

### experiment.Experiment
```python
id: AutoField (primary key)
name: CharField (unique)
description: TextField
created_at: DateTimeField
is_active: BooleanField
```

### experiment.Variation
```python
id: AutoField (primary key)
experiment: ForeignKey -> Experiment
name: CharField
weight: PositiveIntegerField
views: PositiveIntegerField
conversions: PositiveIntegerField
created_at: DateTimeField
```

---

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd basebuild
./dev_setup.sh

# Start services
bb clean

# Run tests
bb test
```

## BB CLI Tool

The `bb` command provides shortcuts for common development tasks.

**Installation:**
```bash
./dev_setup.sh
```

### Available Commands

| Command | Description |
|---------|-------------|
| `bb test` | Run the full test suite or selective tests (Django, Cypress E2E, Cypress Component, Vitest) |
| `bb clean` | Tear down and rebuild Docker containers |
| `bb shell` | Open a Django shell in the backend container |
| `bb db` | Open a PostgreSQL shell in the database container |
| `bb coverage` | Generate coverage reports for the Django test suite |
| `bb quality` | Run code quality tools (flake8, black, isort) |
| `bb migrate` | Run Django migrations |
| `bb makemigrations` | Create new Django migrations |
| `bb manage` | Execute any Django management command |
| `bb app` | Create a new Django app |
| `bb dumpdata` | Export database data to YAML |
| `bb loaddata` | Import database data from YAML |
| `bb config` | View and manage project configuration |
| `bb sync` | Sync changes from BaseBuild template |

**Common Commands:**
```bash
bb test              # Run all tests
bb test -b           # Django tests only
bb test -c           # Frontend tests only
bb clean             # Rebuild containers
bb migrate           # Run migrations
bb shell             # Django shell
bb manage <command>  # Any Django management command
```

For extending the CLI tool, see `bb.d/README.md`.

## Creating a New Project

Use the `start_new_project.sh` script to create a new project from the BaseBuild template:

```bash
./start_new_project.sh my-new-app
```

### Interactive Configuration

The script will prompt you to configure:

| Prompt | Options | Default |
|--------|---------|--------|
| GitHub username | Any valid username | `josephbrockw` |
| Frontend | `next`, `react`, `none` | `next` |
| Backend | `django`, `none` | `django` |
| Background workers | `django-worker`, `independent-worker`, `none` | `none` |
| Mobile (React Native) | `y`, `n` | `n` |
| Documentation (Docusaurus) | `y`, `n` | `n` |

### What the Script Does

1. Prompts for GitHub username and service configuration
2. Creates a new directory `../my-new-app`
3. Clones the BaseBuild template into it
4. Generates a customized `basebuild.toml` based on your selections
5. **Removes unused directories** (e.g., `react/` if you chose `next`)
6. Sets up git remotes:
   - `origin` -> your new repo (`git@github.com:<username>/my-new-app.git`)
   - `upstream` -> BaseBuild (for syncing updates)
7. Commits the configuration

### After Running the Script

```bash
# 1. Move into your new project
cd ../my-new-app

# 2. Create the GitHub repository
#    Go to: https://github.com/new
#    Name it the same as your project (e.g., my-new-app)

# 3. Push to GitHub
git push -u origin main

# 4. Set up development environment
./dev_setup.sh

# 5. Start services
bb clean

# 6. Verify everything is running
bb config
docker ps
```

## New Project Setup Checklist

Complete these steps when starting a new project to customize your application:

### Repo Setup

- [ ] Run `./start_new_project.sh <new-repo-name>` to create a new project
- [ ] Create the GitHub repository at https://github.com/new
- [ ] Push to GitHub: `git push -u origin main`

### Initial Setup
- [ ] Run `./dev_setup.sh` to install dependencies and set up the BB CLI
- [ ] Run `bb clean` to build and start all Docker containers
- [ ] Verify all services are running with `docker ps` and `bb config`

### Branding & Theming (Next.js/React Frontend)

- [ ] **Generate brand color palette:**
  1. Go to [UI Colors](https://uicolors.app/create) or [Tailwind Shades](https://www.tailwindshades.com/)
  2. Enter your primary brand color (e.g., `#FF5733`)
  3. Copy the generated color scale (50-950 shades)

- [ ] **Update theme in [next/src/app/globals.css](cci:7://file:///Users/joewilkinson/Projects/basebuild/next/src/app/globals.css:0:0-0:0):**
  1. Open the `@theme` section
  2. Replace `--color-primary-*` values with your generated palette
  3. Update `--color-secondary-*` if you have an accent color
  4. Optionally adjust `--radius-*` values to change component roundness
  5. Save and refresh your browser - all components update automatically!

- [ ] **Test theme changes:**
  - View all button variants: primary, secondary, light, ghost
  - Check form components: inputs, selects, checkboxes, toggles
  - Verify dark mode works correctly
  - Test error/success states use the correct colors

### Environment Configuration

- [ ] Create `django/.env.secrets` with required Django environment variables
- [ ] Create `react/.env.secrets` or `next/.env.local` for frontend API URLs
- [ ] Update `basebuild.toml` to enable/disable services for your project
- [ ] Set up database credentials in `.env.secrets`

### Content & Configuration

- [ ] Update application name in `basebuild.toml`
- [ ] Replace logo and favicon in `public/` directory
- [ ] Update meta tags and SEO information
- [ ] Configure API endpoints and base URLs

### Testing

- [ ] Run `bb test` to ensure all tests pass
- [ ] Run `bb test -b` for backend tests only
- [ ] Run `bb test -c` for frontend tests only
- [ ] Add project-specific tests as needed

### Deployment Preparation

- [ ] Review and update `.gitignore` for your specific needs
- [ ] Set up CI/CD pipelines if needed
- [ ] Configure production environment variables
- [ ] Test production build locally

## Configuration

Edit `basebuild.toml` to enable/disable services:

```toml
[services]
django = true        # Django API + PostgreSQL
next = true          # Next.js frontend
react = false        # React frontend
celery_django = false # Django-integrated Celery worker
celery_worker = false # Independent Celery worker
broker = false       # Redis message broker
flower = false       # Celery monitoring dashboard
docs = false         # Docusaurus documentation
mobile = false       # React Native mobile app
```

**Commands:**
```bash
bb config            # View configuration
bb config services   # List enabled services
bb config validate   # Validate basebuild.toml
```

**Presets:**
```bash
cp config-presets/django-monolith.toml basebuild.toml
cp config-presets/react-django-simple.toml basebuild.toml
```

## Syncing Template Updates

```bash
bb sync              # Fetch, merge, and push
bb sync --no-push    # Fetch and merge only
bb sync --dry-run    # Preview changes
```

## Project Structure

```
basebuild/
├── .github/
│   └── workflows/
│       ├── django-tests.yml      # Django CI workflow
│       └── nextjs-tests.yml      # Next.js CI workflow
│
├── django/                        # Django API backend
│   ├── account/                   # User model, OTP model
│   ├── api/                       # API views, serializers, middleware
│   │   ├── views/
│   │   │   ├── auth.py           # Auth endpoints
│   │   │   ├── user.py           # User endpoints
│   │   │   ├── payment.py        # Product/discount endpoints
│   │   │   └── experiment.py     # Experiment endpoints
│   │   └── serializers.py        # All API serializers
│   ├── config/                    # Django settings, ASGI, URLs
│   ├── experiment/                # A/B testing models
│   ├── payment/                   # Stripe integration, subscription models
│   ├── worker/                    # Celery tasks and configuration
│   ├── templates/                 # Email templates
│   └── tests/                     # Django test suite
│
├── next/                          # Next.js frontend
│   └── src/
│       ├── api/                   # API client
│       ├── app/                   # Next.js App Router pages
│       │   ├── login/
│       │   ├── register/
│       │   ├── verify/
│       │   ├── dashboard/
│       │   └── component-library/
│       ├── components/
│       │   ├── bb/               # BaseBuild component library
│       │   │   ├── ui/           # Button, Input, Select, etc.
│       │   │   ├── layout/       # Container, Stack, Flex, etc.
│       │   │   ├── navigation/   # Navbar, Tabs, Dropdown, etc.
│       │   │   ├── feedback/     # Alert, Modal, Toast, etc.
│       │   │   ├── data-display/ # Table, Badge, Avatar, etc.
│       │   │   └── forms/        # FormField, FormGroup, useForm
│       │   └── ui/               # Shared UI exports
│       ├── contexts/             # React contexts (AuthContext)
│       ├── theme/                # Theme configuration
│       └── utils/                # Auth utilities
│
├── react/                         # React frontend (alternative to Next.js)
├── celeryworker/                  # Independent Celery worker
├── docs/                          # Docusaurus documentation site
├── app/                           # React Native mobile app
├── bb.d/                          # BB CLI tool modules
├── config-presets/                # Pre-configured basebuild.toml templates
└── basebuild.toml                 # Service configuration
```

## Environment Variables

Create `django/.env.secrets` and `react/.env.secrets` as needed.

### Django Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `1` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts | `localhost 127.0.0.1` |
| `SQL_ENGINE` | Database engine | `django.db.backends.postgresql` |
| `SQL_DATABASE` | Database name | `db_dev` |
| `SQL_USER` | Database user | `admin` |
| `SQL_PASSWORD` | Database password | `admin` |
| `SQL_HOST` | Database host | `db` |
| `SQL_PORT` | Database port | `5432` |
| `FRONTEND_URL` | Frontend URL for CORS/emails | `http://localhost:3001` |
| `OTP_EXPIRATION_MINUTES` | OTP token lifetime | `15` |
| `PAYMENT_REQUIRED` | Require payment on registration | `False` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `REMEMBER_ME_TOKEN_LIFETIME_DAYS` | Extended token lifetime | `30` |

### Next.js Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8009` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `0.1.0` |

---

## Features NOT Yet Implemented

Use this section to identify features that would be appropriate for new project plans:

### Authentication Gaps
- Social OAuth (Google, GitHub, etc.)
- Two-factor authentication (2FA)
- Session management UI (view/revoke sessions)
- Account deletion flow

### User Features
- User avatar upload
- User settings page
- Notification preferences
- Activity log/audit trail

### Payment Gaps
- Subscription management UI (upgrade/downgrade/cancel)
- Invoice history page
- Payment method management
- Usage-based billing
- Stripe webhook handlers

### Admin Features
- Admin dashboard
- User management interface
- Analytics dashboard
- Content management

### Communication
- In-app notifications
- WebSocket real-time updates
- Push notifications

### Content
- Blog/CMS system
- Help center/FAQ
- Changelog/release notes

---

## Architectural Patterns

When extending this project, follow these patterns:

### Django API Patterns
1. **Use StandardViewSet** for all new viewsets
2. **Use StandardResponse** for all responses
3. **Place serializers** in `api/serializers.py`
4. **Place views** in `api/views/` directory
5. **Register routes** in `config/urls.py`

### Next.js Patterns
1. **Use App Router** (`app/` directory)
2. **Use existing components** from `components/bb/`
3. **Extend API client** in `api/client.ts`
4. **Add routes to config** in `config.ts`
5. **Use AuthContext** for protected routes

### Testing Patterns
1. **Django:** Use `django.test.TestCase`, place in `tests/`
2. **Next.js:** Use Vitest, place `.test.ts` files alongside components
3. **E2E:** Use Playwright, place in `e2e/` directory
