import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { FormField } from './FormField';

describe('FormField', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <FormField>
          <input data-testid="input" />
        </FormField>
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<FormField data-testid="field">Content</FormField>);
      const field = screen.getByTestId('field');
      expect(field.tagName).toBe('DIV');
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(
        <FormField label="Username" htmlFor="username">
          <input id="username" />
        </FormField>
      );
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      render(
        <FormField>
          <input />
        </FormField>
      );
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(
        <FormField label="Email" htmlFor="email-input">
          <input id="email-input" />
        </FormField>
      );
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });
  });

  describe('Required indicator', () => {
    it('shows required indicator when required is true', () => {
      render(
        <FormField label="Name" required>
          <input />
        </FormField>
      );
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('does not show required indicator by default', () => {
      render(
        <FormField label="Name">
          <input />
        </FormField>
      );
      expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
    });
  });

  describe('Error message', () => {
    it('renders error message when provided', () => {
      render(
        <FormField error="This field is required" htmlFor="test">
          <input />
        </FormField>
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('error message has alert role', () => {
      render(
        <FormField error="Error message" htmlFor="test">
          <input />
        </FormField>
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Error message');
    });

    it('applies error styling', () => {
      render(
        <FormField error="Error" htmlFor="test">
          <input />
        </FormField>
      );
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveClass('text-danger-500');
    });
  });

  describe('Helper text', () => {
    it('renders helper text when provided', () => {
      render(
        <FormField helperText="Enter your username" htmlFor="test">
          <input />
        </FormField>
      );
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });

    it('does not render helper text when error is present', () => {
      render(
        <FormField helperText="Helper" error="Error" htmlFor="test">
          <input />
        </FormField>
      );
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('applies muted styling to helper text', () => {
      render(
        <FormField helperText="Help text" htmlFor="test">
          <input />
        </FormField>
      );
      expect(screen.getByText('Help text')).toHaveClass('text-text-muted');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(
        <FormField className="custom-class" data-testid="field">
          <input />
        </FormField>
      );
      expect(screen.getByTestId('field')).toHaveClass('custom-class');
    });

    it('merges with base w-full class', () => {
      render(
        <FormField className="mt-4" data-testid="field">
          <input />
        </FormField>
      );
      const field = screen.getByTestId('field');
      expect(field).toHaveClass('w-full', 'mt-4');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<FormField ref={ref}>Content</FormField>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <FormField data-testid="field" id="form-field" aria-label="Field">
          <input />
        </FormField>
      );
      const field = screen.getByTestId('field');
      expect(field).toHaveAttribute('id', 'form-field');
      expect(field).toHaveAttribute('aria-label', 'Field');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(FormField.displayName).toBe('FormField');
    });
  });
});
