import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  describe('Rendering', () => {
    it('renders toggle with required props', () => {
      render(<Toggle id="test-toggle" name="test" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('id', 'test-toggle');
      expect(toggle).toHaveAttribute('name', 'test');
    });

    it('renders with label', () => {
      render(<Toggle id="test-toggle" name="test" label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Toggle id="test-toggle" name="test" />);
      const label = screen.getByRole('switch').closest('label');
      expect(label?.textContent).toBe('');
    });

    it('renders unchecked by default', () => {
      render(<Toggle id="test-toggle" name="test" />);
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Toggle id="test-toggle" name="test" checked readOnly />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('has proper role attribute', () => {
      render(<Toggle id="test-toggle" name="test" />);
      expect(screen.getByRole('switch')).toHaveAttribute('role', 'switch');
    });
  });

  describe('Checked State', () => {
    it('has aria-checked="false" when unchecked', () => {
      render(<Toggle id="test-toggle" name="test" checked={false} readOnly />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('has aria-checked="true" when checked', () => {
      render(<Toggle id="test-toggle" name="test" checked readOnly />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Disabled State', () => {
    it('disables toggle when disabled is true', () => {
      render(<Toggle id="test-toggle" name="test" disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('enables toggle when disabled is false', () => {
      render(<Toggle id="test-toggle" name="test" disabled={false} />);
      expect(screen.getByRole('switch')).toBeEnabled();
    });


    it('prevents onChange when disabled', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" disabled onChange={handleChange} />);

      await userEvent.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when clicked', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" onChange={handleChange} />);

      await userEvent.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange with checked state (true)', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" onChange={handleChange} />);

      await userEvent.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange with checked state (false)', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" checked onChange={handleChange} />);

      await userEvent.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it('can toggle via user interaction', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      await userEvent.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('can be clicked via label', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" label="Click me" onChange={handleChange} />);

      await userEvent.click(screen.getByText('Click me'));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Controlled Component', () => {
    it('updates when controlled checked prop changes', () => {
      const { rerender } = render(<Toggle id="test-toggle" name="test" checked={false} readOnly />);
      expect(screen.getByRole('switch')).not.toBeChecked();

      rerender(<Toggle id="test-toggle" name="test" checked={true} readOnly />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('does not toggle on click when controlled without onChange', async () => {
      render(<Toggle id="test-toggle" name="test" checked={false} readOnly />);
      const toggle = screen.getByRole('switch');

      await userEvent.click(toggle);
      expect(toggle).not.toBeChecked();
    });
  });

  describe('Custom Attributes', () => {
    it('applies custom className', () => {
      const { container } = render(<Toggle id="test-toggle" name="test" className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Toggle
          id="test-toggle"
          name="test"
          data-testid="custom-toggle"
          aria-label="Custom toggle"
        />
      );
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('data-testid', 'custom-toggle');
      expect(toggle).toHaveAttribute('aria-label', 'Custom toggle');
    });

    it('supports value attribute', () => {
      render(<Toggle id="test-toggle" name="test" value="enabled" />);
      expect(screen.getByRole('switch')).toHaveAttribute('value', 'enabled');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Toggle id="test-toggle" name="test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('allows ref access to toggle methods', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Toggle id="test-toggle" name="test" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('checkbox');
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be toggled with Space key', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      await userEvent.keyboard(' ');

      expect(handleChange).toHaveBeenCalled();
    });

    it('is focusable', () => {
      render(<Toggle id="test-toggle" name="test" />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(toggle).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Toggle id="test-toggle" name="test" disabled />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(toggle).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(<Toggle id="test-toggle" name="test" label="Enable feature" />);
      const toggle = screen.getByRole('switch');
      const label = toggle.closest('label');
      expect(label).toContainElement(toggle);
      expect(label).toHaveTextContent('Enable feature');
    });

    it('has role="switch"', () => {
      render(<Toggle id="test-toggle" name="test" />);
      expect(screen.getByRole('switch')).toHaveAttribute('role', 'switch');
    });

    it('has aria-checked attribute', () => {
      render(<Toggle id="test-toggle" name="test" checked readOnly />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

  });

  describe('Form Integration', () => {
    it('works with required attribute', () => {
      render(<Toggle id="test-toggle" name="test" required />);
      expect(screen.getByRole('switch')).toBeRequired();
    });

    it('includes name attribute for form submission', () => {
      render(<Toggle id="test-toggle" name="notifications" />);
      expect(screen.getByRole('switch')).toHaveAttribute('name', 'notifications');
    });
  });


  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Toggle.displayName).toBe('Toggle');
    });
  });

  describe('Event Object', () => {
    it('provides both checked state and event object to onChange', async () => {
      const handleChange = vi.fn();
      render(<Toggle id="test-toggle" name="test" onChange={handleChange} />);

      await userEvent.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledWith(
        expect.any(Boolean),
        expect.objectContaining({
          target: expect.any(HTMLInputElement)
        })
      );
    });
  });
});
