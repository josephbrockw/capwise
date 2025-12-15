import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders checkbox with required props', () => {
      render(<Checkbox id="test-checkbox" name="test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(checkbox).toHaveAttribute('name', 'test');
    });

    it('renders with label', () => {
      render(<Checkbox id="test-checkbox" name="test" label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Checkbox id="test-checkbox" name="test" />);
      expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });

    it('renders unchecked by default', () => {
      render(<Checkbox id="test-checkbox" name="test" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Checkbox id="test-checkbox" name="test" checked readOnly />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Checked State', () => {
    it('displays checkmark when checked', () => {
      render(<Checkbox id="test-checkbox" name="test" checked readOnly />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('does not display checkmark when unchecked', () => {
      render(<Checkbox id="test-checkbox" name="test" checked={false} readOnly />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Disabled State', () => {
    it('disables checkbox when disabled is true', () => {
      render(<Checkbox id="test-checkbox" name="test" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('enables checkbox when disabled is false', () => {
      render(<Checkbox id="test-checkbox" name="test" disabled={false} />);
      expect(screen.getByRole('checkbox')).toBeEnabled();
    });


    it('prevents onChange when disabled', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" disabled onChange={handleChange} />);

      await userEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('renders error message when error prop is provided', () => {
      render(<Checkbox id="test-checkbox" name="test" error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('does not render error message when error prop is empty', () => {
      render(<Checkbox id="test-checkbox" name="test" error="" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });


    it('sets aria-invalid when error is present', () => {
      render(<Checkbox id="test-checkbox" name="test" error="Error message" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error message with aria-describedby', () => {
      render(<Checkbox id="test-checkbox" name="test" error="Error message" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'test-checkbox-error');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'test-checkbox-error');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when clicked', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" onChange={handleChange} />);

      await userEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('receives event object in onChange handler', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" onChange={handleChange} />);

      await userEvent.click(screen.getByRole('checkbox'));

      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
      const event = handleChange.mock.calls[0][0];
      expect(event.target).toBeDefined();
      expect(typeof event.target.checked).toBe('boolean');
    });

    it('can toggle via user interaction', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      await userEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });

    it('can be clicked via label', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" label="Click me" onChange={handleChange} />);

      await userEvent.click(screen.getByText('Click me'));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Controlled Component', () => {
    it('updates when controlled checked prop changes', () => {
      const { rerender } = render(<Checkbox id="test-checkbox" name="test" checked={false} readOnly />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(<Checkbox id="test-checkbox" name="test" checked={true} readOnly />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('does not toggle on click when controlled without onChange', async () => {
      render(<Checkbox id="test-checkbox" name="test" checked={false} readOnly />);
      const checkbox = screen.getByRole('checkbox');

      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Custom Attributes', () => {
    it('applies custom className', () => {
      const { container } = render(<Checkbox id="test-checkbox" name="test" className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Checkbox
          id="test-checkbox"
          name="test"
          data-testid="custom-checkbox"
          aria-label="Custom checkbox"
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-testid', 'custom-checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Custom checkbox');
    });

    it('supports value attribute', () => {
      render(<Checkbox id="test-checkbox" name="test" value="option1" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('value', 'option1');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('allows ref access to checkbox methods', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Checkbox id="test-checkbox" name="test" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('checkbox');
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be toggled with Space key', async () => {
      const handleChange = vi.fn();
      render(<Checkbox id="test-checkbox" name="test" onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await userEvent.keyboard(' ');

      expect(handleChange).toHaveBeenCalled();
    });

    it('is focusable', () => {
      render(<Checkbox id="test-checkbox" name="test" />);
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Checkbox id="test-checkbox" name="test" disabled />);
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(<Checkbox id="test-checkbox" name="test" label="Terms and Conditions" />);
      const checkbox = screen.getByLabelText('Terms and Conditions');
      expect(checkbox).toBeInTheDocument();
    });

    it('includes aria-invalid when in error state', () => {
      render(<Checkbox id="test-checkbox" name="test" error="Error" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not have aria-invalid when not in error state', () => {
      render(<Checkbox id="test-checkbox" name="test" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('has proper aria-describedby for error messages', () => {
      render(<Checkbox id="test-checkbox" name="test" error="Error message" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'test-checkbox-error');
    });

  });

  describe('Form Integration', () => {
    it('works with required attribute', () => {
      render(<Checkbox id="test-checkbox" name="test" required />);
      expect(screen.getByRole('checkbox')).toBeRequired();
    });

    it('includes name attribute for form submission', () => {
      render(<Checkbox id="test-checkbox" name="terms" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'terms');
    });
  });

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Checkbox.displayName).toBe('Checkbox');
    });
  });
});
