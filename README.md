# BaseBuild

A full-stack application template with Django, React, and Docker.

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

```bash
./start_new_project.sh <new-repo-name>
```

Interactive prompts will configure:
- **Frontend:** React, Django templates, or none
- **Backend:** Django or none
- **Workers:** Django worker, independent worker, or none
- **Mobile:** React Native app (y/n)
- **Docs:** Docusaurus (y/n)

**After creation:**
```bash
cd ../<new-repo-name>
./dev_setup.sh
bb clean
```

## Configuration

Edit `basebuild.toml` to enable/disable services:

```toml
[services]
django = true        # Django + PostgreSQL
react = true         # React
celery_django = true # Background tasks
broker = true        # Redis
flower = true        # Task monitoring
docs = false         # Docusaurus
mobile = false       # React Native
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
├── django/          # Django backend
├── react/           # React frontend
├── celeryworker/    # Independent worker
├── docs/            # Docusaurus docs
├── app/             # React Native
├── bb.d/            # CLI tool modules
└── basebuild.toml   # Service configuration
```

## Environment Variables

Create `django/.env.secrets` and `react/.env.secrets` as needed.

**Django:** `DEBUG`, `SECRET_KEY`, `DATABASE_URL`
**React:** `REACT_APP_API_BASE_URL`, `REACT_APP_NAME`
**PostgreSQL:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
