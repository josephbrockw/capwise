import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-zinc-100');
    });

    it('applies primary variant', () => {
      render(<Badge variant="primary" data-testid="badge">Primary</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-primary-100');
    });

    it('applies success variant', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-success-100');
    });

    it('applies warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-warning-100');
    });

    it('applies danger variant', () => {
      render(<Badge variant="danger" data-testid="badge">Danger</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('bg-danger-100');
    });
  });

  describe('Sizes', () => {
    it('applies md size by default', () => {
      render(<Badge data-testid="badge">Medium</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('text-sm');
    });

    it('applies sm size', () => {
      render(<Badge size="sm" data-testid="badge">Small</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('text-xs');
    });

    it('applies lg size', () => {
      render(<Badge size="lg" data-testid="badge">Large</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('text-base');
    });
  });

  describe('Rounded', () => {
    it('applies rounded corners by default', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('rounded');
    });

    it('applies rounded-full when rounded prop is true', () => {
      render(<Badge rounded data-testid="badge">Rounded</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('rounded-full');
    });
  });

  describe('Dot indicator', () => {
    it('shows dot when dot prop is true', () => {
      render(<Badge dot data-testid="badge">With Dot</Badge>);
      const badge = screen.getByTestId('badge');
      const dot = badge.querySelector('.rounded-full.w-1\\.5');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Remove button', () => {
    it('shows remove button when onRemove is provided', () => {
      render(<Badge onRemove={() => {}}>Removable</Badge>);
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('calls onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const handleRemove = vi.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Test</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Badge.displayName).toBe('Badge');
    });
  });
});
