import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Progress } from './Progress';

describe('Progress', () => {
  describe('Rendering', () => {
    it('renders progressbar role', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('sets correct aria values', () => {
      render(<Progress value={30} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '30');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders with custom max', () => {
      render(<Progress value={5} max={10} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });
  });

  describe('Label', () => {
    it('shows label when showLabel is true', () => {
      render(<Progress value={50} showLabel />);
      const labels = screen.getAllByText('50%');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows custom label', () => {
      render(<Progress value={50} showLabel label="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not show label by default', () => {
      render(<Progress value={50} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('applies sm size', () => {
      render(<Progress value={50} size="sm" />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-1');
    });

    it('applies md size by default', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-2');
    });

    it('applies lg size', () => {
      render(<Progress value={50} size="lg" />);
      expect(screen.getByRole('progressbar')).toHaveClass('h-3');
    });
  });

  describe('Variants', () => {
    it('applies default variant', () => {
      render(<Progress value={50} data-testid="progress" />);
      const inner = screen.getByRole('progressbar').firstChild;
      expect(inner).toHaveClass('bg-primary-500');
    });

    it('applies success variant', () => {
      render(<Progress value={50} variant="success" />);
      const inner = screen.getByRole('progressbar').firstChild;
      expect(inner).toHaveClass('bg-success-500');
    });

    it('applies warning variant', () => {
      render(<Progress value={50} variant="warning" />);
      const inner = screen.getByRole('progressbar').firstChild;
      expect(inner).toHaveClass('bg-warning-500');
    });

    it('applies danger variant', () => {
      render(<Progress value={50} variant="danger" />);
      const inner = screen.getByRole('progressbar').firstChild;
      expect(inner).toHaveClass('bg-danger-500');
    });
  });

  describe('Bounds', () => {
    it('clamps value at 0', () => {
      render(<Progress value={-10} data-testid="progress" />);
      const inner = screen.getByRole('progressbar').firstChild as HTMLElement;
      expect(inner.style.width).toBe('0%');
    });

    it('clamps value at max', () => {
      render(<Progress value={150} data-testid="progress" />);
      const inner = screen.getByRole('progressbar').firstChild as HTMLElement;
      expect(inner.style.width).toBe('100%');
    });
  });

  describe('Animation', () => {
    it('applies animate-pulse when animated', () => {
      render(<Progress value={50} animated />);
      const inner = screen.getByRole('progressbar').firstChild;
      expect(inner).toHaveClass('animate-pulse');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Progress value={50} className="custom-class" data-testid="progress" />);
      expect(screen.getByTestId('progress')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Progress ref={ref} value={50} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Progress.displayName).toBe('Progress');
    });
  });
});
