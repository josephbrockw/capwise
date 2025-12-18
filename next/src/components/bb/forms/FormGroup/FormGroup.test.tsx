import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { FormGroup } from './FormGroup';

describe('FormGroup', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <FormGroup>
          <input data-testid="input" />
        </FormGroup>
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('renders as a fieldset element', () => {
      render(<FormGroup data-testid="group">Content</FormGroup>);
      const group = screen.getByTestId('group');
      expect(group.tagName).toBe('FIELDSET');
    });

    it('renders multiple children', () => {
      render(
        <FormGroup>
          <input data-testid="input1" />
          <input data-testid="input2" />
          <input data-testid="input3" />
        </FormGroup>
      );
      expect(screen.getByTestId('input1')).toBeInTheDocument();
      expect(screen.getByTestId('input2')).toBeInTheDocument();
      expect(screen.getByTestId('input3')).toBeInTheDocument();
    });
  });

  describe('Title', () => {
    it('renders title as legend when provided', () => {
      render(<FormGroup title="Personal Information">Content</FormGroup>);
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    it('legend has correct styling', () => {
      render(<FormGroup title="Section Title">Content</FormGroup>);
      const legend = screen.getByText('Section Title');
      expect(legend.tagName).toBe('LEGEND');
      expect(legend).toHaveClass('text-base', 'font-semibold', 'text-text');
    });

    it('does not render legend when title not provided', () => {
      render(<FormGroup>Content</FormGroup>);
      expect(screen.queryByRole('legend')).not.toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      render(
        <FormGroup title="Section" description="Please fill out the following fields">
          Content
        </FormGroup>
      );
      expect(screen.getByText('Please fill out the following fields')).toBeInTheDocument();
    });

    it('description has muted styling', () => {
      render(
        <FormGroup title="Section" description="Description text">
          Content
        </FormGroup>
      );
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-sm', 'text-text-muted');
    });

    it('renders description without title', () => {
      render(
        <FormGroup description="Just a description">
          Content
        </FormGroup>
      );
      expect(screen.getByText('Just a description')).toBeInTheDocument();
    });
  });

  describe('Gap variants', () => {
    it('applies md gap by default', () => {
      render(<FormGroup data-testid="group">Content</FormGroup>);
      const childWrapper = screen.getByTestId('group').querySelector('div');
      expect(childWrapper).toHaveClass('space-y-4');
    });

    it('applies none gap', () => {
      render(<FormGroup gap="none" data-testid="group">Content</FormGroup>);
      const childWrapper = screen.getByTestId('group').querySelector('div');
      expect(childWrapper).toHaveClass('space-y-0');
    });

    it('applies sm gap', () => {
      render(<FormGroup gap="sm" data-testid="group">Content</FormGroup>);
      const childWrapper = screen.getByTestId('group').querySelector('div');
      expect(childWrapper).toHaveClass('space-y-3');
    });

    it('applies lg gap', () => {
      render(<FormGroup gap="lg" data-testid="group">Content</FormGroup>);
      const childWrapper = screen.getByTestId('group').querySelector('div');
      expect(childWrapper).toHaveClass('space-y-6');
    });
  });

  describe('Base styling', () => {
    it('removes default fieldset styling', () => {
      render(<FormGroup data-testid="group">Content</FormGroup>);
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('border-none', 'p-0', 'm-0');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(
        <FormGroup className="custom-class" data-testid="group">
          Content
        </FormGroup>
      );
      expect(screen.getByTestId('group')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to fieldset element', () => {
      const ref = createRef<HTMLFieldSetElement>();
      render(<FormGroup ref={ref}>Content</FormGroup>);
      expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
      expect(ref.current?.tagName).toBe('FIELDSET');
    });
  });

  describe('Additional props', () => {
    it('spreads additional HTML attributes', () => {
      render(
        <FormGroup data-testid="group" id="personal-info" aria-label="Personal">
          Content
        </FormGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveAttribute('id', 'personal-info');
      expect(group).toHaveAttribute('aria-label', 'Personal');
    });
  });

  describe('Display name', () => {
    it('has correct displayName for debugging', () => {
      expect(FormGroup.displayName).toBe('FormGroup');
    });
  });
});
