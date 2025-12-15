import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectOption } from './Select';

const mockOptions: SelectOption[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

describe('Select', () => {
  describe('Rendering', () => {
    it('renders select with required props', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          label="Test Label"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders without label', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          placeholder="Choose an option"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('displays selected value', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          value="2"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('displays placeholder when no value selected', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          placeholder="Select..."
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByText('Select...')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk when required is true', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          label="Required Field"
          required
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('sets aria-required when required', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          required
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Disabled State', () => {
    it('disables select when disabled is true', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          disabled
          options={mockOptions}
          onChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('tabindex', '-1');
    });

    it('prevents opening dropdown when disabled', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          disabled
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders error message when error prop is provided', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          error="This field is required"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('sets aria-invalid when error is present', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          error="Error"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Dropdown Interaction', () => {
    it('opens dropdown when clicked', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown when clicked outside', async () => {
      const handleChange = vi.fn();
      render(
        <div>
          <Select
            id="test-select"
            name="test"
            options={mockOptions}
            onChange={handleChange}
          />
          <button>Outside</button>
        </div>
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('displays all options when open', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');

      mockOptions.forEach(option => {
        expect(within(listbox).getByText(option.label)).toBeInTheDocument();
      });
    });

    it('displays "No options available" when options array is empty', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={[]}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('calls onChange when option is selected', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Option 2'));

      expect(handleChange).toHaveBeenCalledWith({
        target: {
          name: 'test',
          value: '2'
        }
      });
    });

    it('closes dropdown after option selection', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Option 2'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('highlights selected option', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          value="2"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      const selectedOption = screen.getByRole('option', { selected: true });
      expect(selectedOption).toHaveTextContent('Option 2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      select.focus();
      await userEvent.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown with Space key', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      select.focus();
      await userEvent.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown with ArrowDown key', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      select.focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Debouncing', () => {
    it('accepts debounceTime prop', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
          debounceTime={0}
        />
      );

      rerender(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
          debounceTime={300}
        />
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Custom Attributes', () => {
    it('applies custom className to wrapper', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          id="test-select"
          name="test"
          className="custom-class"
          options={mockOptions}
          onChange={handleChange}
        />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Hidden Input', () => {
    it('includes hidden input for form submission', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          id="test-select"
          name="test"
          value="2"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('name', 'test');
      expect(hiddenInput).toHaveAttribute('value', '2');
    });

    it('sets required on hidden input when required', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          id="test-select"
          name="test"
          required
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute('required');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          label="Test Label"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded attribute', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-expanded');
    });

    it('displays selected value', () => {
      const handleChange = vi.fn();
      render(
        <Select
          id="test-select"
          name="test"
          value="2"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Select.displayName).toBe('Select');
    });
  });

  describe('TypeScript Generics', () => {
    it('works with number values', () => {
      const handleChange = vi.fn();
      const numericOptions: SelectOption<number>[] = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ];

      render(
        <Select<number>
          id="test-select"
          name="test"
          value={2}
          options={numericOptions}
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Two')).toBeInTheDocument();
    });
  });
});
