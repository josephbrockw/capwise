import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Stack } from './Stack';

describe('Stack', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Stack>Content</Stack>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack.tagName).toBe('DIV');
    });
  });

  describe('Base classes', () => {
    it('applies flex and flex-col classes', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Gap variants', () => {
    it('applies md gap class by default', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-4');
    });

    it('applies none gap class', () => {
      render(<Stack gap="none" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-0');
    });

    it('applies xs gap class', () => {
      render(<Stack gap="xs" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-1');
    });

    it('applies sm gap class', () => {
      render(<Stack gap="sm" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-2');
    });

    it('applies lg gap class', () => {
      render(<Stack gap="lg" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-6');
    });

    it('applies xl gap class', () => {
      render(<Stack gap="xl" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('gap-8');
    });
  });

  describe('Align variants', () => {
    it('applies stretch alignment by default', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('items-stretch');
    });

    it('applies start alignment', () => {
      render(<Stack align="start" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('items-start');
    });

    it('applies center alignment', () => {
      render(<Stack align="center" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('items-center');
    });

    it('applies end alignment', () => {
      render(<Stack align="end" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('items-end');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Stack className="custom-class" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('custom-class');
    });

    it('merges custom className with base classes', () => {
      render(<Stack className="custom-class" gap="sm" align="center" data-testid="stack">Content</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('custom-class', 'flex', 'flex-col', 'gap-2', 'items-center');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Stack ref={ref}>Content</Stack>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <Stack aria-label="Stack container" data-testid="stack" id="main-stack">
          Content
        </Stack>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveAttribute('aria-label', 'Stack container');
      expect(stack).toHaveAttribute('id', 'main-stack');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(Stack.displayName).toBe('Stack');
    });
  });
});
