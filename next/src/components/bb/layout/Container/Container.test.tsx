import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Container } from './Container';

describe('Container', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Container>Content</Container>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container.tagName).toBe('DIV');
    });
  });

  describe('Size variants', () => {
    it('applies default size class by default', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-screen-lg');
    });

    it('applies sm size class', () => {
      render(<Container size="sm" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-screen-sm');
    });

    it('applies lg size class', () => {
      render(<Container size="lg" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-screen-xl');
    });

    it('applies xl size class', () => {
      render(<Container size="xl" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-screen-2xl');
    });

    it('applies full size class', () => {
      render(<Container size="full" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-full');
    });
  });

  describe('Centered', () => {
    it('applies mx-auto when centered is true (default)', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('mx-auto');
    });

    it('does not apply mx-auto when centered is false', () => {
      render(<Container centered={false} data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).not.toHaveClass('mx-auto');
    });
  });

  describe('Base classes', () => {
    it('applies base width and padding classes', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('w-full', 'px-4');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Container className="custom-class" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('custom-class');
    });

    it('merges custom className with base classes', () => {
      render(<Container className="custom-class" size="sm" data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('custom-class', 'w-full', 'px-4', 'max-w-screen-sm', 'mx-auto');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Container ref={ref}>Content</Container>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <Container aria-label="Main container" data-testid="container" id="main">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('aria-label', 'Main container');
      expect(container).toHaveAttribute('id', 'main');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(Container.displayName).toBe('Container');
    });
  });
});
