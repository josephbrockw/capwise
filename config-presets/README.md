# Configuration Presets

This directory contains preset configurations for common BaseBuild architectures.

## Available Presets

### Full Stack (Default)
**File**: `../basebuild.toml` (project root)

Complete setup with all services enabled:
- React frontend
- Django backend
- Django-integrated Celery worker
- Independent Python Celery worker
- Redis broker
- Flower monitoring
- PostgreSQL database
- Docusaurus documentation
- React Native mobile app

**Use case**: Full-featured applications that need all components

---

### Django Monolith
**File**: `django-monolith.toml`

Django serves both backend and frontend:
- Django backend with template rendering
- PostgreSQL database
- No separate frontend service
- No workers
- No docs
- No mobile

**Use case**: Traditional Django applications using Django templates

**To use**:
```bash
cp config-presets/django-monolith.toml basebuild.toml
```

---

### React + Django Simple
**File**: `react-django-simple.toml`

Minimal full-stack setup:
- React frontend
- Django API backend
- PostgreSQL database
- No workers
- No docs
- No mobile

**Use case**: Simple applications that don't need background task processing

**To use**:
```bash
cp config-presets/react-django-simple.toml basebuild.toml
```

---

### NextJS + Django (Future)
**File**: `nextjs-django.toml`

Modern stack with NextJS:
- NextJS frontend
- Django API backend
- Django-integrated Celery worker
- Redis broker
- Flower monitoring
- PostgreSQL database

**Use case**: Modern applications preferring NextJS for frontend

**To use**:
```bash
cp config-presets/nextjs-django.toml basebuild.toml
```

*Note: NextJS integration is not yet implemented*

---

## Creating Custom Presets

1. Copy an existing preset as a starting point
2. Modify the service configurations
3. Save with a descriptive name
4. Document your preset in this README

## Configuration Reference

See the main `basebuild.toml` file for detailed comments on all available configuration options.
