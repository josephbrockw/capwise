import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Skeleton, CardSkeleton, TableRowSkeleton, AvatarSkeleton } from './Skeleton';

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('renders with aria-hidden', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    });

    it('has pulse animation', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
    });
  });

  describe('Variants', () => {
    it('applies rectangular variant by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-lg');
    });

    it('applies text variant', () => {
      render(<Skeleton variant="text" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-4', 'rounded');
    });

    it('applies title variant', () => {
      render(<Skeleton variant="title" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-6', 'rounded');
    });

    it('applies circular variant', () => {
      render(<Skeleton variant="circular" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full');
    });

    it('applies button variant', () => {
      render(<Skeleton variant="button" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-10', 'rounded-lg');
    });
  });

  describe('Dimensions', () => {
    it('applies width as string', () => {
      render(<Skeleton width="100%" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '100%' });
    });

    it('applies width as number (px)', () => {
      render(<Skeleton width={200} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '200px' });
    });

    it('applies height as string', () => {
      render(<Skeleton height="50px" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '50px' });
    });

    it('applies height as number (px)', () => {
      render(<Skeleton height={100} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '100px' });
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Skeleton ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Skeleton.displayName).toBe('Skeleton');
    });
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton structure', () => {
    render(<CardSkeleton data-testid="card-skeleton" />);
    const card = screen.getByTestId('card-skeleton');
    expect(card).toBeInTheDocument();
    expect(card.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(<CardSkeleton className="custom-class" data-testid="card-skeleton" />);
    expect(screen.getByTestId('card-skeleton')).toHaveClass('custom-class');
  });

  it('has correct displayName', () => {
    expect(CardSkeleton.displayName).toBe('CardSkeleton');
  });
});

describe('TableRowSkeleton', () => {
  it('renders default 4 columns', () => {
    render(<TableRowSkeleton data-testid="row-skeleton" />);
    const row = screen.getByTestId('row-skeleton');
    expect(row.querySelectorAll('[aria-hidden="true"]').length).toBe(4);
  });

  it('renders custom number of columns', () => {
    render(<TableRowSkeleton columns={6} data-testid="row-skeleton" />);
    const row = screen.getByTestId('row-skeleton');
    expect(row.querySelectorAll('[aria-hidden="true"]').length).toBe(6);
  });

  it('has correct displayName', () => {
    expect(TableRowSkeleton.displayName).toBe('TableRowSkeleton');
  });
});

describe('AvatarSkeleton', () => {
  it('renders circular skeleton', () => {
    render(<AvatarSkeleton data-testid="avatar-skeleton" />);
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('rounded-full');
  });

  it('applies md size by default', () => {
    render(<AvatarSkeleton data-testid="avatar-skeleton" />);
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('w-10', 'h-10');
  });

  it('applies sm size', () => {
    render(<AvatarSkeleton size="sm" data-testid="avatar-skeleton" />);
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('w-8', 'h-8');
  });

  it('applies lg size', () => {
    render(<AvatarSkeleton size="lg" data-testid="avatar-skeleton" />);
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('w-12', 'h-12');
  });

  it('has correct displayName', () => {
    expect(AvatarSkeleton.displayName).toBe('AvatarSkeleton');
  });
});
