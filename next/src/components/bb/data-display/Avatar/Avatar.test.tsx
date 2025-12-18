import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Avatar, AvatarGroup } from './Avatar';

describe('Avatar', () => {
  describe('Rendering', () => {
    it('renders with image when src is provided', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="User" />);
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders initials when name is provided without src', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders single initial for single name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders fallback icon when no src or name', () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom fallback', () => {
      render(<Avatar fallback={<span data-testid="custom-fallback">?</span>} />);
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('applies md size by default', () => {
      render(<Avatar name="John" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('w-10', 'h-10');
    });

    it('applies xs size', () => {
      render(<Avatar name="John" size="xs" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('w-6', 'h-6');
    });

    it('applies sm size', () => {
      render(<Avatar name="John" size="sm" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('w-8', 'h-8');
    });

    it('applies lg size', () => {
      render(<Avatar name="John" size="lg" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('w-12', 'h-12');
    });

    it('applies xl size', () => {
      render(<Avatar name="John" size="xl" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Rounded', () => {
    it('applies rounded-full by default', () => {
      render(<Avatar name="John" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
    });

    it('applies rounded-lg when rounded is false', () => {
      render(<Avatar name="John" rounded={false} data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('rounded-lg');
    });
  });

  describe('Color generation', () => {
    it('generates consistent color for same name', () => {
      const { rerender } = render(<Avatar name="John Doe" data-testid="avatar" />);
      const firstClasses = screen.getByTestId('avatar').className;

      rerender(<Avatar name="John Doe" data-testid="avatar" />);
      const secondClasses = screen.getByTestId('avatar').className;

      expect(firstClasses).toBe(secondClasses);
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Avatar name="John" className="custom-class" data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Avatar ref={ref} name="John" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Avatar.displayName).toBe('Avatar');
    });
  });
});

describe('AvatarGroup', () => {
  describe('Rendering', () => {
    it('renders all avatars', () => {
      render(
        <AvatarGroup>
          <Avatar name="John" />
          <Avatar name="Jane" />
          <Avatar name="Bob" />
        </AvatarGroup>
      );
      const jInitials = screen.getAllByText('J');
      expect(jInitials).toHaveLength(2);
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('limits avatars when max is provided', () => {
      render(
        <AvatarGroup max={2}>
          <Avatar name="John" />
          <Avatar name="Jane" />
          <Avatar name="Bob" />
        </AvatarGroup>
      );
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('shows correct remaining count', () => {
      render(
        <AvatarGroup max={1}>
          <Avatar name="John" />
          <Avatar name="Jane" />
          <Avatar name="Bob" />
          <Avatar name="Alice" />
        </AvatarGroup>
      );
      expect(screen.getByText('+3')).toBeInTheDocument();
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(AvatarGroup.displayName).toBe('AvatarGroup');
    });
  });
});
