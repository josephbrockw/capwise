This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Theming & Rebranding

All theme configuration is centralized in `src/theme/theme.css`. Changes take effect immediately via hot reload.

### Quick Start

1. Open `src/theme/theme.css`
2. Modify values in the relevant section
3. Save - changes apply immediately

### Theme File Structure

```
src/theme/
├── theme.css    # All theme configuration (colors, fonts, spacing, sizing)
├── index.ts     # TypeScript exports for JS usage

public/brand/
├── README.md    # Instructions for brand assets
├── logo.*       # Primary logo (any format: svg, png, jpg, webp)
├── logo-dark.*  # Logo for dark backgrounds (optional)
├── favicon.*    # Browser tab icon (ico, png, svg)
└── og-image.*   # Social sharing image (png, jpg)
```

### What Design Teams Need to Provide

When rebranding, collect the following from your design team:

#### 1. Brand Colors (Required)

All colors generate full shade palettes (50-900) automatically.

| Token | Description | Example |
|-------|-------------|---------|
| `primary` | Main brand color (buttons, primary CTAs) | `#2563eb` |
| `secondary` | Supporting brand color (secondary buttons, accents) | `#0d9488` |
| `accent` | Highlight color (badges, tags, special elements) | `#8b5cf6` |
| `success` | Positive actions, confirmations, valid states | `#16a34a` |
| `failure` | Errors, destructive actions, invalid states | `#dc2626` |

#### 2. Background & Text Colors (Required)

Provide for **both light and dark modes**:

| Token | Description | Light Example | Dark Example |
|-------|-------------|---------------|--------------|
| `background` | Page/app background | `#ffffff` | `#09090b` |
| `text` | Primary text color | `#171717` | `#fafafa` |
| `text-muted` | Secondary/subtle text | `#71717a` | `#a1a1aa` |

#### 3. Typography (Required)

| Item | Description | Example |
|------|-------------|---------|
| **Heading Font** | Font family for h1-h6 | Inter, Poppins, Playfair Display |
| **Body Font** | Font family for paragraphs | System default, Open Sans, Lato |
| **Font Files/Links** | Google Fonts URL or font files | `fonts.google.com/css2?family=Inter` |

For each heading level (h1-h6), optionally provide:
- Font size (e.g., `3rem`, `48px`)
- Font weight (e.g., `700`, `bold`)
- Line height (e.g., `1.1`)
- Letter spacing (e.g., `-0.025em`)

#### 4. UI Elements (Optional but Recommended)

| Item | Description | Example |
|------|-------------|---------|
| `warning` | Caution states, important notices | `#d97706` |
| `info` | Informational states, tips | `#0ea5e9` |
| `surface` | Card/panel backgrounds | `#ffffff` (light) |
| `border` | Default border color | `#e4e4e7` (light) |

#### 5. Spacing & Shape (Optional)

| Item | Description | Options |
|------|-------------|---------|
| **Border Radius** | Corner roundness | Sharp (`0`), Soft (`0.375rem`), Rounded (`0.5rem`), Pill (`9999px`) |
| **Button Style** | Button corner style | Square, Rounded, Pill |
| **Card Style** | Card corner style | Sharp, Soft, Rounded |
| **Shadow Intensity** | Elevation preference | None, Subtle, Medium, Pronounced |

#### 6. Component Sizing (Optional)

| Item | Description | Default |
|------|-------------|---------|
| **Input Height** | Form field heights (sm/md/lg) | `32px` / `40px` / `48px` |
| **Container Width** | Max content width | `1024px` (lg) |
| **Focus Ring** | Accessibility focus color | Uses primary color |

#### 7. Brand Assets (Optional)

Place in `public/brand/` folder. Any image format accepted (SVG, PNG, JPG, WebP).

| Item | Description | Recommended Size |
|------|-------------|------------------|
| **Logo** | Primary logo | Vector (SVG) or 2x display size |
| **Logo (dark)** | Logo for dark backgrounds | Same as primary |
| **Favicon** | Browser tab icon | 32x32 or 16x16 |
| **OG Image** | Social sharing preview | 1200x630 |

### How to Add Custom Fonts

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

### Example: Complete Rebrand

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

### Using Theme Values in Components

```tsx
import { brandColors, typography, cssVar } from '@/theme';

// Access color values directly
const primary = brandColors.primary;  // '#2563eb'

// Use CSS variables in inline styles
const style = { color: cssVar('primary', 600) };  // 'var(--color-primary-600)'

// Access typography config
const h1Size = typography.headings.h1.size;  // '3rem'
```

### Resources

- **Color Palette Generator:** https://uicolors.app/create
- **Google Fonts:** https://fonts.google.com
- **Tailwind Color Reference:** https://tailwindcss.com/docs/customizing-colors
