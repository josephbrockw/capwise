import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('renders with default title', () => {
      render(<EmptyState />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(<EmptyState title="No results found" />);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('renders message', () => {
      render(<EmptyState message="Try adjusting your search" />);
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('renders default icon', () => {
      render(<EmptyState data-testid="empty" />);
      const container = screen.getByTestId('empty');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom icon', () => {
      render(<EmptyState icon={<span data-testid="custom-icon">🔍</span>} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Action button', () => {
    it('renders action button when actionLabel and onAction provided', () => {
      render(<EmptyState actionLabel="Create New" onAction={() => {}} />);
      expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
    });

    it('does not render action button without onAction', () => {
      render(<EmptyState actionLabel="Create New" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onAction when button is clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(<EmptyState actionLabel="Create New" onAction={handleAction} />);

      await user.click(screen.getByRole('button', { name: 'Create New' }));

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<EmptyState className="custom-class" data-testid="empty" />);
      expect(screen.getByTestId('empty')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<EmptyState ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(EmptyState.displayName).toBe('EmptyState');
    });
  });
});
