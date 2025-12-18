import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Divider } from './Divider';

describe('Divider', () => {
  describe('Rendering', () => {
    it('renders as an hr element', () => {
      render(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider.tagName).toBe('HR');
    });
  });

  describe('Base classes', () => {
    it('applies border-none and bg-border classes', () => {
      render(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('border-none', 'bg-border');
    });
  });

  describe('Orientation', () => {
    it('applies horizontal classes by default', () => {
      render(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('w-full', 'h-px');
    });

    it('applies vertical classes when orientation is vertical', () => {
      render(<Divider orientation="vertical" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('w-px', 'h-full', 'self-stretch');
    });
  });

  describe('Horizontal spacing', () => {
    it('applies md spacing by default', () => {
      render(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('my-4');
    });

    it('applies none spacing', () => {
      render(<Divider spacing="none" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('my-0');
    });

    it('applies sm spacing', () => {
      render(<Divider spacing="sm" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('my-2');
    });

    it('applies lg spacing', () => {
      render(<Divider spacing="lg" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('my-6');
    });
  });

  describe('Vertical spacing', () => {
    it('applies md spacing by default for vertical', () => {
      render(<Divider orientation="vertical" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('mx-4');
    });

    it('applies none spacing for vertical', () => {
      render(<Divider orientation="vertical" spacing="none" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('mx-0');
    });

    it('applies sm spacing for vertical', () => {
      render(<Divider orientation="vertical" spacing="sm" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('mx-2');
    });

    it('applies lg spacing for vertical', () => {
      render(<Divider orientation="vertical" spacing="lg" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('mx-6');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Divider className="custom-class" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('custom-class');
    });

    it('merges custom className with base classes', () => {
      render(<Divider className="custom-class" orientation="vertical" spacing="sm" data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveClass('custom-class', 'border-none', 'bg-border', 'w-px', 'mx-2');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to hr element', () => {
      const ref = createRef<HTMLHRElement>();
      render(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLHRElement);
      expect(ref.current?.tagName).toBe('HR');
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(<Divider aria-label="Separator" data-testid="divider" id="main-divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toHaveAttribute('aria-label', 'Separator');
      expect(divider).toHaveAttribute('id', 'main-divider');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(Divider.displayName).toBe('Divider');
    });
  });
});
