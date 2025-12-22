---
sidebar_position: 2
---

# Theming & Rebranding

All theme configuration is centralized in `next/src/theme/theme.css`. Changes take effect immediately via hot reload.

## Quick Start

1. Open `src/theme/theme.css`
2. Modify values in the relevant section
3. Save - changes apply immediately

## Theme File Structure

```
next/src/theme/
├── theme.css    # All theme configuration (colors, fonts, spacing, sizing)
└── index.ts     # TypeScript exports for JS usage

next/public/brand/
├── logo.*       # Primary logo (any format: svg, png, jpg, webp)
├── logo-dark.*  # Logo for dark backgrounds (optional)
├── favicon.*    # Browser tab icon (ico, png, svg)
└── og-image.*   # Social sharing image (png, jpg)
```

## Brand Colors

All colors generate full shade palettes (50-900) automatically using the `tailwindcss-palette-generator` plugin.

### Core Brand Colors

```css
@plugin "tailwindcss-palette-generator" {
  /* Core Brand */
  primary: #2563eb;    /* Main brand color - buttons, primary CTAs */
  secondary: #0d9488;  /* Supporting brand color - secondary buttons */
  accent: #8b5cf6;     /* Highlight color - badges, special elements */

  /* Semantic */
  success: #16a34a;    /* Positive actions, confirmations */
  warning: #d97706;    /* Caution states, important notices */
  danger: #dc2626;     /* Errors, destructive actions */
  info: #0ea5e9;       /* Informational states, tips */
}
```

### Generated Shade Usage

Once defined, you can use any shade in Tailwind classes:

```tsx
// Primary color shades
<div className="bg-primary-500 text-primary-50">
<div className="border-primary-300 hover:border-primary-400">

// Semantic colors
<span className="text-success-600">Verified</span>
<span className="text-danger-500">Error</span>
```

## Typography

### Font Families

```css
@theme {
  --font-heading: ui-sans-serif, system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, monospace;
}
```

### Adding Custom Fonts

1. **Add font import to `src/app/globals.css`:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";
@import "../theme/theme.css";
```

2. **Update font families in `src/theme/theme.css`:**

```css
--font-heading: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
```

### Heading Styles

Each heading level (h1-h6) can be customized:

```css
@theme {
  --heading-h1-size: 3rem;
  --heading-h1-weight: 800;
  --heading-h1-line-height: 1.1;
  --heading-h1-tracking: -0.025em;

  --heading-h2-size: 2.25rem;
  --heading-h2-weight: 700;
  --heading-h2-line-height: 1.2;
  --heading-h2-tracking: -0.02em;

  /* ... h3-h6 ... */
}
```

### Body Text

```css
@theme {
  --body-size: 1rem;
  --body-weight: 400;
  --body-line-height: 1.6;

  --body-large-size: 1.125rem;
  --body-small-size: 0.875rem;
}
```

## Spacing & Layout

### Border Radius

```css
@theme {
  /* Base radii */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Component-specific radii */
  --radius-button: 0.5rem;
  --radius-input: 0.5rem;
  --radius-card: 0.75rem;
  --radius-modal: 1rem;
  --radius-badge: 9999px;
  --radius-avatar: 9999px;
}
```

### Component Sizing

```css
@theme {
  /* Input heights */
  --size-input-sm: 2rem;        /* 32px - compact */
  --size-input-md: 2.5rem;      /* 40px - default */
  --size-input-lg: 3rem;        /* 48px - large touch targets */

  /* Input padding */
  --spacing-input-x: 0.75rem;
  --spacing-input-y: 0.5rem;
}
```

### Container Widths

```css
@theme {
  --container-xs: 480px;        /* narrow content, forms */
  --container-sm: 640px;        /* small content areas */
  --container-md: 768px;        /* medium content */
  --container-lg: 1024px;       /* standard page width */
  --container-xl: 1280px;       /* wide layouts */
  --container-2xl: 1536px;      /* full-width dashboards */
}
```

### Shadows

```css
@theme {
  --shadow-none: none;
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## Mode Colors

The theme currently uses dark mode by default. Colors are defined in `:root`:

```css
:root {
  /* Background & Text */
  --background: #0a0a0b;
  --text: #f4f4f5;
  --text-muted: #71717a;

  /* Surfaces */
  --surface: #18181b;          /* Inputs, selects */
  --surface-hover: #27272a;
  --surface-elevated: #27272a; /* Cards, modals */

  /* Borders */
  --border: #3f3f46;
  --border-hover: #52525b;
}
```

### Enabling Light/Dark Mode Switching

To enable mode switching:

1. Move current `:root` values to a `@media (prefers-color-scheme: dark)` block
2. Add light mode values to `:root`
3. Optionally install `next-themes` for a toggle UI

```css
/* Light mode (default) */
:root {
  --background: #ffffff;
  --text: #171717;
  --text-muted: #71717a;
  --surface: #f4f4f5;
  --border: #e4e4e7;
}

/* Dark mode (auto) */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0b;
    --text: #f4f4f5;
    --text-muted: #71717a;
    --surface: #18181b;
    --border: #3f3f46;
  }
}
```

## Focus States

Accessibility-focused focus ring configuration:

```css
@theme {
  --focus-ring-color: var(--color-primary-500);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
```

## Transitions

```css
@theme {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Z-Index Scale

```css
@theme {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

## Using Theme Values in Components

```tsx
import { brandColors, typography, cssVar } from '@/theme';

// Access color values directly
const primary = brandColors.primary;  // '#2563eb'

// Use CSS variables in inline styles
const style = { color: cssVar('primary', 600) };  // 'var(--color-primary-600)'

// Access typography config
const h1Size = typography.headings.h1.size;  // '3rem'
```

## Complete Rebrand Example

```css
/* src/theme/theme.css */

/* 1. Update brand colors */
@plugin "tailwindcss-palette-generator" {
  primary: #8b5cf6;    /* Purple */
  secondary: #ec4899;  /* Pink */
}

/* 2. Update typography */
@theme {
  --font-heading: "Poppins", ui-sans-serif, sans-serif;
  --font-body: "Open Sans", ui-sans-serif, sans-serif;

  --heading-h1-size: 3.5rem;
  --heading-h1-weight: 700;

  /* 3. Update border radius for rounder look */
  --radius-button: 9999px;  /* Pill buttons */
  --radius-card: 1.5rem;    /* More rounded cards */
}
```

## Resources

- **Color Palette Generator:** https://uicolors.app/create
- **Google Fonts:** https://fonts.google.com
- **Tailwind Color Reference:** https://tailwindcss.com/docs/customizing-colors
