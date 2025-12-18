import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Alert } from './Alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('renders with alert role', () => {
      render(<Alert>Message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<Alert title="Alert Title">Message</Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies info variant by default', () => {
      render(<Alert data-testid="alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-primary-50');
    });

    it('applies success variant', () => {
      render(<Alert variant="success" data-testid="alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-success-50');
    });

    it('applies error variant', () => {
      render(<Alert variant="error" data-testid="alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-danger-50');
    });

    it('applies warning variant', () => {
      render(<Alert variant="warning" data-testid="alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-warning-50');
    });
  });

  describe('Close button', () => {
    it('renders close button when onClose is provided', () => {
      render(<Alert onClose={() => {}}>Message</Alert>);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('does not render close button when onClose is not provided', () => {
      render(<Alert>Message</Alert>);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Alert onClose={onClose}>Message</Alert>);

      await user.click(screen.getByRole('button', { name: /dismiss/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom icon', () => {
    it('renders custom icon when provided', () => {
      render(
        <Alert icon={<span data-testid="custom-icon">★</span>}>Message</Alert>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('hides icon when icon is null', () => {
      render(<Alert icon={null} data-testid="alert">Message</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Alert className="custom-class" data-testid="alert">Message</Alert>);
      expect(screen.getByTestId('alert')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Alert ref={ref}>Message</Alert>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Alert.displayName).toBe('Alert');
    });
  });
});
