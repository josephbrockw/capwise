import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with label prop', () => {
      render(<Button label="Click me" />);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('prefers children over label when both are provided', () => {
      render(<Button label="Label">Children</Button>);
      expect(screen.getByRole('button', { name: 'Children' })).toBeInTheDocument();
      expect(screen.queryByText('Label')).not.toBeInTheDocument();
    });

    it('renders with icon', () => {
      render(<Button icon="fa-home" label="Home" />);
      const icon = document.querySelector('.icon.fa-home');
      expect(icon).toBeInTheDocument();
    });

    it('renders icon before content', () => {
      const { container } = render(<Button icon="fa-home">Home</Button>);
      const button = container.querySelector('button');
      expect(button?.innerHTML).toMatch(/icon.*Home/);
    });
  });

  describe('Variants', () => {
    it('renders with primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with light variant', () => {
      render(<Button variant="light">Light</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Tag rendering', () => {
    it('renders as button by default', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders as div when tag="div"', () => {
      render(<Button tag="div">Click me</Button>);
      const div = screen.getByText('Click me');
      expect(div.tagName).toBe('DIV');
    });

    it('sets tabIndex on div variant', () => {
      render(<Button tag="div">Click me</Button>);
      const div = screen.getByText('Click me');
      expect(div).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Full width', () => {
    it('renders full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not apply full width by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Disabled state', () => {
    it('applies disabled attribute on button', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });


    it('applies aria-disabled on button', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies aria-disabled on div variant', () => {
      render(<Button tag="div" disabled>Disabled</Button>);
      const div = screen.getByText('Disabled');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents onClick when disabled (button)', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents onClick when disabled (div)', async () => {
      const handleClick = vi.fn();
      render(<Button tag="div" disabled onClick={handleClick}>Disabled</Button>);

      await userEvent.click(screen.getByText('Disabled'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click handling', () => {
    it('calls onClick when clicked (button)', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when clicked (div)', async () => {
      const handleClick = vi.fn();
      render(<Button tag="div" onClick={handleClick}>Click me</Button>);

      await userEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('receives event object in onClick handler', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Button type', () => {
    it('defaults to type="button"', () => {
      render(<Button>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('accepts type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('accepts type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Styled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('merges custom className with base classes', () => {
      render(<Button className="custom-class" variant="secondary" fullWidth>Styled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class', 'w-full');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('ref is null for div variant', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button tag="div" ref={ref}>Button</Button>);
      expect(ref.current).toBeNull();
    });
  });

  describe('Additional props', () => {
    it('spreads additional button props', () => {
      render(<Button aria-label="Custom label" data-testid="custom-button">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('spreads additional props to div variant', () => {
      render(<Button tag="div" data-testid="custom-div">Button</Button>);
      const div = screen.getByText('Button');
      expect(div).toHaveAttribute('data-testid', 'custom-div');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(Button.displayName).toBe('Button');
    });
  });
});
