---
sidebar_position: 2
---

# Contributing Guide

Thank you for your interest in contributing to BaseBuild! This guide will help you understand how to contribute to the project effectively.

## Development Workflow

### Setting Up Your Development Environment

Before you start contributing, make sure you have set up your development environment by following the [Installation Guide](installation.md).

### Branching Strategy

We follow a feature branch workflow:

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bugfixes
   git checkout -b fix/issue-description
   ```

2. Make your changes, commit them with clear messages
3. Push your branch to the remote repository
4. Create a pull request for review

### Commit Message Guidelines

We follow conventional commit messages to make the commit history more readable:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example: `feat: add payment processing to registration flow`

## Code Style Guidelines

### Frontend (React)

- Follow the ESLint configuration provided in the project
- Use functional components with hooks rather than class components
- Keep components small and focused on a single responsibility
- Use CSS modules or styled-components for styling

### Backend (Django)

- Follow PEP 8 style guidelines
- Write docstrings for all functions, classes, and modules
- Use Django's built-in testing framework for tests
- Keep views thin and move business logic to services or models

## Testing

### Frontend Testing

We use Jest and React Testing Library for frontend tests. To run the tests:

```bash
cd client
npm test
```

### Backend Testing

We use Django's testing framework for backend tests. To run the tests:

```bash
cd backend
python manage.py test
```

## Pull Request Process

1. Update the documentation with details of changes if applicable
2. Make sure all tests pass
3. Update the README.md with details of changes to the interface if applicable
4. The PR will be merged once it receives approval from at least one reviewer

## Code Review Guidelines

When reviewing code, consider the following:

- Does the code work as expected?
- Is the code easy to understand?
- Is the code consistent with the project's style?
- Are there any security concerns?
- Is the code well-tested?

## Getting Help

If you need help with anything, feel free to:

- Open an issue on GitHub
- Reach out to the development team
- Check the documentation for guidance

Thank you for contributing to BaseBuild!
