---
slug: nextjs-frontend
title: Next.js Frontend Added
authors: [basebuild]
tags: [nextjs, frontend, release]
---

BaseBuild now includes a Next.js frontend option alongside the existing React app.

<!-- truncate -->

## Next.js 14+ with App Router

The new Next.js frontend leverages the latest features:

- **App Router** - File-based routing with layouts and server components
- **TypeScript** - Full type safety throughout the codebase
- **Tailwind CSS** - Utility-first styling with custom theme configuration
- **Server Components** - Optimized rendering and data fetching

## Component Library

A comprehensive component library has been built from scratch:

- Organized by category (UI, Feedback, Data Display, Navigation, Forms, Layout)
- Fully typed with TypeScript
- Accessible with ARIA attributes
- Themeable via CSS custom properties

## Theming System

Centralized theme configuration in `src/theme/theme.css`:

- CSS custom properties for all design tokens
- Automatic color palette generation
- Typography, spacing, and shadow scales
- Ready for dark mode switching

## Getting Started

```bash
cd next
npm install
npm run dev
```

The app runs at http://localhost:3000 and connects to the Django API.
