import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element with required props', () => {
      render(<Input id="test-input" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'test');
    });

    it('renders with label', () => {
      render(<Input id="test-input" name="test" label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Input id="test-input" name="test" />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('renders as textarea when multiline is true', () => {
      render(<Input id="test-input" name="test" multiline />);
      expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('renders as input when multiline is false', () => {
      render(<Input id="test-input" name="test" multiline={false} />);
      expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLInputElement);
    });

    it('renders with placeholder', () => {
      render(<Input id="test-input" name="test" placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input id="test-input" name="test" value="Default value" />);
      expect(screen.getByRole('textbox')).toHaveValue('Default value');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk when required is true', () => {
      render(<Input id="test-input" name="test" label="Required Field" required />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show asterisk when required is false', () => {
      render(<Input id="test-input" name="test" label="Optional Field" required={false} />);
      expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
    });

    it('sets required attribute on input element', () => {
      render(<Input id="test-input" name="test" required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled is true', () => {
      render(<Input id="test-input" name="test" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('enables input when disabled is false', () => {
      render(<Input id="test-input" name="test" disabled={false} />);
      expect(screen.getByRole('textbox')).toBeEnabled();
    });

    it('prevents onChange when disabled', async () => {
      const handleChange = vi.fn();
      render(<Input id="test-input" name="test" disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('renders error message when error prop is provided', () => {
      render(<Input id="test-input" name="test" error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('does not render error message when error prop is empty', () => {
      render(<Input id="test-input" name="test" error="" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });


    it('sets aria-invalid when error is present', () => {
      render(<Input id="test-input" name="test" error="Error message" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error message with aria-describedby', () => {
      render(<Input id="test-input" name="test" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'test-input-error');
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input id="test-input" name="test" helperText="Enter your name" />);
      expect(screen.getByText('Enter your name')).toBeInTheDocument();
    });

    it('does not render helper text when error is present', () => {
      render(
        <Input
          id="test-input"
          name="test"
          helperText="Enter your name"
          error="This field is required"
        />
      );
      expect(screen.queryByText('Enter your name')).not.toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('links helper text with aria-describedby', () => {
      render(<Input id="test-input" name="test" helperText="Helper text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when user types', async () => {
      const handleChange = vi.fn();
      render(<Input id="test-input" name="test" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('receives event object in onChange handler', async () => {
      const handleChange = vi.fn();
      render(<Input id="test-input" name="test" onChange={handleChange} />);

      await userEvent.type(screen.getByRole('textbox'), 'a');

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'a'
          })
        })
      );
    });

    it('updates value when controlled', async () => {
      const { rerender } = render(<Input id="test-input" name="test" value="initial" />);
      expect(screen.getByRole('textbox')).toHaveValue('initial');

      rerender(<Input id="test-input" name="test" value="updated" />);
      expect(screen.getByRole('textbox')).toHaveValue('updated');
    });
  });

  describe('Debouncing', () => {
    it('calls onChange immediately when debounceTime is 0', async () => {
      const handleChange = vi.fn();
      render(<Input id="test-input" name="test" onChange={handleChange} debounceTime={0} />);

      await userEvent.type(screen.getByRole('textbox'), 'a');

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('accepts debounceTime prop', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Input id="test-input" name="test" onChange={handleChange} debounceTime={0} />);

      rerender(<Input id="test-input" name="test" onChange={handleChange} debounceTime={300} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Textarea Specific', () => {
    it('renders textarea with custom rows', () => {
      render(<Input id="test-input" name="test" multiline rows={5} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('renders textarea with default rows (3)', () => {
      render(<Input id="test-input" name="test" multiline />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
    });
  });

  describe('Custom Attributes', () => {
    it('applies custom className', () => {
      render(<Input id="test-input" name="test" className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Input
          id="test-input"
          name="test"
          data-testid="custom-input"
          maxLength={10}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('supports autoComplete attribute', () => {
      render(<Input id="test-input" name="test" autoComplete="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input id="test-input" name="test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('forwards ref to textarea element when multiline', () => {
      const ref = vi.fn();
      render(<Input id="test-input" name="test" multiline ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });
  });

  describe('Type Attribute', () => {
    it('defaults to text type for input', () => {
      render(<Input id="test-input" name="test" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('supports different input types', () => {
      render(<Input id="test-input" name="test" type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(<Input id="test-input" name="test" label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('includes aria-invalid when in error state', () => {
      render(<Input id="test-input" name="test" error="Error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not have aria-invalid when not in error state', () => {
      render(<Input id="test-input" name="test" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('has proper aria-describedby for error messages', () => {
      render(<Input id="test-input" name="test" error="Error message" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'test-input-error');
    });
  });

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Input.displayName).toBe('Input');
    });
  });
});
