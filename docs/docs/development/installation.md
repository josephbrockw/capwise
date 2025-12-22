---
sidebar_position: 1
---

# Installation Guide

This guide will help you set up the BaseBuild project for local development.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **macOS** (primary supported platform)
- **Homebrew** - Package manager for macOS
- **Node.js** (v18 or later)
- **Python** (v3.8 or later)
- **Docker and Docker Compose** - For running services

## Quick Start (Recommended)

The easiest way to set up the development environment is using the automated setup script:

```bash
# Clone the repository
git clone https://github.com/josephbrockw/basebuild.git
cd basebuild

# Run the setup script
./dev_setup.sh
```

The script will:

1. Install system dependencies via Homebrew (jpeg, zlib, freetype, postgresql, tmux)
2. Install pip and npm if not present
3. Create a Python virtual environment (`bb-dev`)
4. Install Python dependencies from `django/requirements.txt`
5. Install Node.js dependencies for enabled services (based on `basebuild.toml`)
6. Install Playwright browsers for Next.js E2E tests
7. Set up pre-commit hooks
8. Create the `django/.env.secrets` file with placeholder values
9. Install the `bb` CLI tool to `/usr/local/bin/`

After setup, activate the virtual environment:

```bash
source bb-dev/bin/activate
```

## Configuration

### basebuild.toml

The `basebuild.toml` file controls which services are enabled:

```toml
[services]
# Core services
django = true               # Django API (and database)
react = false               # React frontend
next = true                 # Next.js frontend

# Background task services
celery_django = false       # Django-integrated Celery worker
celery_worker = false       # Independent Python Celery worker
broker = false              # Redis message broker
flower = false              # Celery monitoring dashboard

# Optional services
docs = true                 # Docusaurus documentation
mobile = false              # React Native app
```

Enable or disable services by changing `true`/`false` values.

## Manual Setup

If you prefer to set up manually or encounter issues with the automated script:

### 1. Clone the Repository

```bash
git clone https://github.com/josephbrockw/basebuild.git
cd basebuild
```

### 2. Django API Setup

```bash
# Create and activate virtual environment
python3 -m venv bb-dev
source bb-dev/bin/activate

# Install Python dependencies
pip install -r django/requirements.txt

# Create secrets file
cp django/.env.dev django/.env.secrets
# Edit django/.env.secrets with your actual values
```

### 3. Frontend Setup (Next.js)

```bash
cd next
npm install
npx playwright install  # For E2E tests
```

### 4. Frontend Setup (React - if enabled)

```bash
cd react
npm install
```

### 5. Install BB CLI Tool

```bash
chmod +x bb.sh
sudo cp bb.sh /usr/local/bin/bb
sudo cp -r bb.d /usr/local/bin/bb.d
```

## Running Services with Docker

Start all enabled services using Docker Compose:

```bash
docker-compose up
```

Or use the `bb` CLI tool:

```bash
bb start
```

### Service URLs

| Service | URL |
|---------|-----|
| Django API | http://localhost:8009 |
| Next.js | http://localhost:3002 |
| React | http://localhost:3000|
| Docs | http://localhost:3000 |

## Development Workflow

### Using the BB CLI

The `bb` command provides shortcuts for common development tasks:

```bash
bb test         # Run tests
bb shell        # Django shell
bb migrate      # Run migrations
bb logs         # View logs
bb clean        # Clean up Docker resources
```

See the [CLI Tool Documentation](./cli-tool) for all available commands.

### Running Tests

```bash
# All tests
bb test

# Django tests only
bb test django

# Next.js tests only
bb test next

# React tests only
bb test react
```

## Troubleshooting

### Permission Issues with BB CLI

If you get permission errors when installing the CLI:

```bash
sudo chmod +x bb.sh
sudo cp bb.sh /usr/local/bin/bb
sudo cp -r bb.d /usr/local/bin/bb.d
```

### Docker Issues

```bash
# Reset Docker environment
bb clean

# Rebuild containers
docker-compose build --no-cache
docker-compose up
```

### Port Conflicts

Check if ports are already in use:

```bash
lsof -i :8009  # Django
lsof -i :3002  # Next.js
lsof -i :3000  # React
```

### Virtual Environment

Always ensure the virtual environment is activated:

```bash
source bb-dev/bin/activate
```

## Next Steps

- [CLI Tool Documentation](./cli-tool) - Learn about the `bb` command
- [Django API Overview](/docs/services/django/overview) - Backend documentation
- [Next.js Overview](/docs/services/next/overview) - Frontend documentation
- [Environment Variables](/docs/devops/environment-variables) - Configuration reference
