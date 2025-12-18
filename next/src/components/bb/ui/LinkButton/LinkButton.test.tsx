import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  describe('Rendering', () => {
    it('renders as link', () => {
      render(<LinkButton href="/page">Click me</LinkButton>);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(<LinkButton href="/page">Click me</LinkButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('has correct href', () => {
      render(<LinkButton href="/dashboard">Dashboard</LinkButton>);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('External links', () => {
    it('opens in new tab when external', () => {
      render(<LinkButton href="https://example.com" external>External</LinkButton>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not add target for internal links', () => {
      render(<LinkButton href="/internal">Internal</LinkButton>);
      expect(screen.getByRole('link')).not.toHaveAttribute('target');
    });
  });

  describe('Variants', () => {
    it('applies primary variant by default', () => {
      render(<LinkButton href="/page">Primary</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('bg-primary-600');
    });

    it('applies secondary variant', () => {
      render(<LinkButton href="/page" variant="secondary">Secondary</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('border-border');
    });

    it('applies ghost variant', () => {
      render(<LinkButton href="/page" variant="ghost">Ghost</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('applies sm size', () => {
      render(<LinkButton href="/page" size="sm">Small</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('px-4');
    });

    it('applies md size by default', () => {
      render(<LinkButton href="/page">Medium</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('px-6');
    });

    it('applies lg size', () => {
      render(<LinkButton href="/page" size="lg">Large</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('px-8');
    });
  });

  describe('Full width', () => {
    it('applies full width class', () => {
      render(<LinkButton href="/page" fullWidth>Full Width</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('w-full');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<LinkButton href="/page" className="custom-class">Custom</LinkButton>);
      expect(screen.getByRole('link')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to anchor element', () => {
      const ref = createRef<HTMLAnchorElement>();
      render(<LinkButton ref={ref} href="/page">Link</LinkButton>);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(LinkButton.displayName).toBe('LinkButton');
    });
  });
});
