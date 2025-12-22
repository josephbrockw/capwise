---
sidebar_position: 1
---

# BaseBuild Introduction

Welcome to the BaseBuild documentation. This guide will help you understand the structure and functionality of the BaseBuild project.

## What is BaseBuild?

BaseBuild is a full-stack application template that provides a streamlined development experience for building modern web and mobile applications. It includes multiple frontend options, a Django API backend, and comprehensive tooling.

## Key Features

- **Multiple Frontend Options**: Next.js, React, and React Native mobile app
- **Django API Backend**: RESTful API with authentication, user management, and payments
- **Modern UI Components**: Comprehensive component libraries for both React and Next.js
- **Developer Tooling**: BB CLI for common development tasks
- **Docker-Based Development**: Easy setup with Docker Compose
- **Theming System**: Centralized theme configuration with hot reload

## Architecture Overview

```
basebuild/
├── django/         # Django API backend
├── next/           # Next.js frontend (primary)
├── react/          # React frontend (alternative)
├── app/            # React Native mobile app
├── docs/           # This documentation (Docusaurus)
├── bb.d/           # BB CLI tool commands
└── docker-compose.yml
```

## Getting Started

1. **[Installation Guide](development/installation)** - Set up your development environment
2. **[CLI Tool](development/cli-tool)** - Learn the `bb` command shortcuts

## Services Documentation

- **[Django API](services/django/overview)** - Backend API documentation
- **[Next.js](services/next/overview)** - Next.js frontend with component library
- **[React](services/react/overview)** - React frontend documentation
- **[Mobile](services/mobile/overview)** - React Native app (in development)

## Configuration

- **[Environment Variables](devops/environment-variables)** - All configuration options

## Quick Links

| Task | Command/Link |
|------|--------------|
| Start development | `./dev_setup.sh` |
| Run all services | `bb clean` |
| Run tests | `bb test` |
| View logs | `bb logs` |
