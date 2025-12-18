import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  describe('Rendering', () => {
    it('renders as navigation element', () => {
      render(<Navbar data-testid="navbar" />);
      expect(screen.getByTestId('navbar').tagName).toBe('NAV');
    });

    it('renders logo as link', () => {
      render(<Navbar logo="MyApp" logoHref="/home" />);
      const logoLink = screen.getByRole('link', { name: 'MyApp' });
      expect(logoLink).toHaveAttribute('href', '/home');
    });

    it('renders children in nav area', () => {
      render(
        <Navbar logo="App">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </Navbar>
      );
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('renders actions', () => {
      render(
        <Navbar
          logo="App"
          actions={<button>Sign In</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies sticky class when sticky is true', () => {
      render(<Navbar sticky data-testid="navbar" />);
      expect(screen.getByTestId('navbar')).toHaveClass('sticky');
    });

    it('applies border by default (not transparent)', () => {
      render(<Navbar data-testid="navbar" />);
      expect(screen.getByTestId('navbar')).toHaveClass('border-b');
    });

    it('removes border when transparent', () => {
      render(<Navbar transparent data-testid="navbar" />);
      expect(screen.getByTestId('navbar')).not.toHaveClass('border-b');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Navbar className="custom-class" data-testid="navbar" />);
      expect(screen.getByTestId('navbar')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to nav element', () => {
      const ref = createRef<HTMLElement>();
      render(<Navbar ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Navbar.displayName).toBe('Navbar');
    });
  });
});
