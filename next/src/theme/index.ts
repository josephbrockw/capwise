/**
 * Theme exports for TypeScript usage
 *
 * All theme values are configured in theme.css
 * Edit theme.css to change colors, fonts, etc. - no build step needed!
 */

/**
 * Brand colors - base values
 * Keep in sync with theme.css @plugin block
 */
export const brandColors = {
  primary: '#2563eb',
  secondary: '#0d9488',
  accent: '#8b5cf6',
  success: '#16a34a',
  warning: '#d97706',
  failure: '#dc2626',
  info: '#0ea5e9',
} as const;

/**
 * Mode colors - background and text
 * Keep in sync with theme.css light/dark mode sections
 */
export const modeColors = {
  light: {
    background: '#ffffff',
    text: '#171717',
    textMuted: '#71717a',
    surface: '#fafafa',
    surfaceElevated: '#ffffff',
    border: '#e4e4e7',
  },
  dark: {
    background: '#0a0a0b',
    text: '#f4f4f5',
    textMuted: '#71717a',
    surface: '#18181b',
    surfaceElevated: '#27272a',
    border: '#3f3f46',
  },
} as const;

/** Current active mode colors (dark by default) */
export const currentMode = modeColors.dark;

/**
 * Component sizing tokens
 * Keep in sync with theme.css component sizing section
 */
export const sizing = {
  input: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    paddingX: '0.75rem',
    paddingY: '0.5rem',
  },
  container: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * Typography configuration
 * Keep in sync with theme.css typography section
 */
export const typography = {
  fonts: {
    heading: 'ui-sans-serif, system-ui, sans-serif',
    body: 'ui-sans-serif, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  },
  headings: {
    h1: { size: '3rem', weight: 800, lineHeight: 1.1, tracking: '-0.025em' },
    h2: { size: '2.25rem', weight: 700, lineHeight: 1.2, tracking: '-0.02em' },
    h3: { size: '1.875rem', weight: 600, lineHeight: 1.25, tracking: '-0.015em' },
    h4: { size: '1.5rem', weight: 600, lineHeight: 1.3, tracking: '-0.01em' },
    h5: { size: '1.25rem', weight: 600, lineHeight: 1.4, tracking: '0' },
    h6: { size: '1rem', weight: 600, lineHeight: 1.5, tracking: '0' },
  },
  body: {
    size: '1rem',
    weight: 400,
    lineHeight: 1.6,
    large: { size: '1.125rem', lineHeight: 1.7 },
    small: { size: '0.875rem', lineHeight: 1.5 },
  },
} as const;

/**
 * CSS variable reference helper
 * Usage: cssVar('primary', 600) => 'var(--color-primary-600)'
 */
export function cssVar(colorName: string, shade?: number): string {
  if (shade !== undefined) {
    return `var(--color-${colorName}-${shade})`;
  }
  return `var(--${colorName})`;
}

/**
 * Heading CSS variable helper
 * Usage: headingVar('h1', 'size') => 'var(--heading-h1-size)'
 */
export function headingVar(
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  property: 'size' | 'weight' | 'line-height' | 'tracking'
): string {
  return `var(--heading-${level}-${property})`;
}
