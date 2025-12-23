# BaseBuild

A full-stack application template with Django, Next.js, React, and Docker.

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
├── django/          # Django API backend
├── next/            # Next.js frontend (primary)
├── react/           # React frontend (alternative)
├── celeryworker/    # Independent Celery worker
├── docs/            # Docusaurus documentation
├── app/             # React Native mobile app
├── bb.d/            # CLI tool modules
└── basebuild.toml   # Service configuration
```

## Environment Variables

Create `django/.env.secrets` and `react/.env.secrets` as needed.

**Django:** `DEBUG`, `SECRET_KEY`, `DATABASE_URL`
**React:** `REACT_APP_API_BASE_URL`, `REACT_APP_NAME`
**PostgreSQL:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
