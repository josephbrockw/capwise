import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavLink } from './NavLink';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('NavLink', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<NavLink href="/dashboard">Dashboard</NavLink>);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders as a link', () => {
      render(<NavLink href="/dashboard">Dashboard</NavLink>);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Active state', () => {
    it('applies active class when path matches', () => {
      render(<NavLink href="/dashboard">Dashboard</NavLink>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-primary-600');
    });

    it('applies inactive class when path does not match', () => {
      render(<NavLink href="/settings">Settings</NavLink>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-text-secondary');
    });

    it('sets aria-current when active', () => {
      render(<NavLink href="/dashboard">Dashboard</NavLink>);
      expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current when inactive', () => {
      render(<NavLink href="/settings">Settings</NavLink>);
      expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
    });
  });

  describe('Custom classes', () => {
    it('applies custom activeClassName', () => {
      render(
        <NavLink href="/dashboard" activeClassName="custom-active">
          Dashboard
        </NavLink>
      );
      expect(screen.getByRole('link')).toHaveClass('custom-active');
    });

    it('applies custom inactiveClassName', () => {
      render(
        <NavLink href="/settings" inactiveClassName="custom-inactive">
          Settings
        </NavLink>
      );
      expect(screen.getByRole('link')).toHaveClass('custom-inactive');
    });

    it('applies additional className', () => {
      render(
        <NavLink href="/dashboard" className="extra-class">
          Dashboard
        </NavLink>
      );
      expect(screen.getByRole('link')).toHaveClass('extra-class');
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(NavLink.displayName).toBe('NavLink');
    });
  });
});
