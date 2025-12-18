import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders with status role', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with default loading text for screen readers', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(<Spinner label="Please wait..." />);
      const labels = screen.getAllByText('Please wait...');
      expect(labels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Size variants', () => {
    it('applies md size by default', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner').querySelector('div');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('applies sm size', () => {
      render(<Spinner size="sm" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner').querySelector('div');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('applies lg size', () => {
      render(<Spinner size="lg" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner').querySelector('div');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Animation', () => {
    it('has spin animation class', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner').querySelector('div');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Spinner className="custom-class" data-testid="spinner" />);
      expect(screen.getByTestId('spinner')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Spinner ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Spinner.displayName).toBe('Spinner');
    });
  });
});
