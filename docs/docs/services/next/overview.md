---
sidebar_position: 1
---

# Next.js Overview

The BaseBuild Next.js frontend is a modern React application built with Next.js 14+ using the App Router. It provides server-side rendering, a comprehensive component library, and a powerful theming system.

## Technology Stack

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Playwright**: End-to-end testing
- **Vitest**: Unit testing with React Testing Library

## Project Structure

The frontend code is organized in the `next` directory:

```
next/
├── public/
│   └── brand/            # Brand assets (logo, favicon, og-image)
├── src/
│   ├── api/              # API client utilities
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── verify/       # Email verification
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── bb/           # BaseBuild component library
│   │   │   ├── data-display/
│   │   │   ├── feedback/
│   │   │   ├── forms/
│   │   │   ├── layout/
│   │   │   ├── navigation/
│   │   │   └── ui/
│   │   └── ui/           # App-specific components
│   ├── contexts/         # React contexts
│   ├── theme/            # Theme configuration
│   │   ├── theme.css     # CSS variables and theming
│   │   └── index.ts      # TypeScript exports
│   ├── utils/            # Utility functions
│   └── config.ts         # App configuration
├── tests/
│   └── e2e/              # Playwright E2E tests
└── package.json
```

## Key Features

### App Router

Uses Next.js App Router for:
- Server-side rendering (SSR)
- Server components
- Streaming and suspense
- Nested layouts

### Component Library

A comprehensive set of reusable components organized by category:
- **Data Display**: Avatar, Badge, EmptyState, Progress, Table
- **Feedback**: Alert, ConfirmDialog, Modal, Skeleton, Spinner, Toast
- **Forms**: FormField, FormGroup, useForm hook
- **Layout**: Container, Divider, Flex, Stack
- **Navigation**: Breadcrumbs, Dropdown, NavLink, Navbar, Tabs
- **UI**: Button, Checkbox, Input, Label, LinkButton, Select, Toggle

### Theming System

Centralized theme configuration in `src/theme/theme.css` with:
- CSS custom properties for all design tokens
- Automatic color palette generation
- Typography system
- Dark mode support (ready to enable)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home/landing page |
| `/login` | User login |
| `/register` | User registration |
| `/verify` | Email verification |
| `/dashboard` | User dashboard |
| `/component-library` | Component showcase |

## API Integration

The app uses a centralized configuration for API routes in `src/config.ts`:

```typescript
import config from '@/config';

// Access API routes
const loginUrl = config.api.routes.auth.login;
// Returns: '/api/auth/login'

// Full URL with base
const fullUrl = `${config.apiBaseUrl}${config.api.routes.auth.login}`;
```

## Getting Started

```bash
# Navigate to the next directory
cd next

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000.

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Using the bb CLI
bb test next
```

## Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```
