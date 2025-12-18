import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Flex } from './Flex';

describe('Flex', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Flex>Content</Flex>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Flex>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Flex>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex.tagName).toBe('DIV');
    });
  });

  describe('Base classes', () => {
    it('applies flex and flex-row classes', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex', 'flex-row');
    });
  });

  describe('Gap variants', () => {
    it('applies md gap class by default', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-4');
    });

    it('applies none gap class', () => {
      render(<Flex gap="none" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-0');
    });

    it('applies xs gap class', () => {
      render(<Flex gap="xs" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-1');
    });

    it('applies sm gap class', () => {
      render(<Flex gap="sm" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-2');
    });

    it('applies lg gap class', () => {
      render(<Flex gap="lg" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-6');
    });

    it('applies xl gap class', () => {
      render(<Flex gap="xl" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('gap-8');
    });
  });

  describe('Align variants', () => {
    it('applies center alignment by default', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('items-center');
    });

    it('applies start alignment', () => {
      render(<Flex align="start" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('items-start');
    });

    it('applies end alignment', () => {
      render(<Flex align="end" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('items-end');
    });

    it('applies stretch alignment', () => {
      render(<Flex align="stretch" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('items-stretch');
    });

    it('applies baseline alignment', () => {
      render(<Flex align="baseline" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('items-baseline');
    });
  });

  describe('Justify variants', () => {
    it('applies start justification by default', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-start');
    });

    it('applies center justification', () => {
      render(<Flex justify="center" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-center');
    });

    it('applies end justification', () => {
      render(<Flex justify="end" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-end');
    });

    it('applies between justification', () => {
      render(<Flex justify="between" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-between');
    });

    it('applies around justification', () => {
      render(<Flex justify="around" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-around');
    });

    it('applies evenly justification', () => {
      render(<Flex justify="evenly" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-evenly');
    });
  });

  describe('Wrap', () => {
    it('does not apply flex-wrap by default', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).not.toHaveClass('flex-wrap');
    });

    it('applies flex-wrap when wrap is true', () => {
      render(<Flex wrap data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-wrap');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Flex className="custom-class" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('custom-class');
    });

    it('merges custom className with base classes', () => {
      render(<Flex className="custom-class" gap="sm" align="start" justify="between" data-testid="flex">Content</Flex>);
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('custom-class', 'flex', 'flex-row', 'gap-2', 'items-start', 'justify-between');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Flex ref={ref}>Content</Flex>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <Flex aria-label="Flex container" data-testid="flex" id="main-flex">
          Content
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveAttribute('aria-label', 'Flex container');
      expect(flex).toHaveAttribute('id', 'main-flex');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(Flex.displayName).toBe('Flex');
    });
  });
});
