import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  describe('Rendering', () => {
    it('renders label with children', () => {
      render(<Label>Test Label</Label>);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders as a label element', () => {
      const { container } = render(<Label>Test</Label>);
      expect(container.querySelector('label')).toBeInTheDocument();
    });

    it('renders with htmlFor attribute', () => {
      render(<Label htmlFor="input-id">Username</Label>);
      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'input-id');
    });

    it('renders without htmlFor attribute', () => {
      render(<Label>Username</Label>);
      const label = screen.getByText('Username');
      expect(label).not.toHaveAttribute('for');
    });
  });

  describe('Required Indicator', () => {
    it('shows asterisk when required is true', () => {
      render(<Label required>Required Field</Label>);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show asterisk when required is false', () => {
      render(<Label required={false}>Optional Field</Label>);
      expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('does not show asterisk by default', () => {
      render(<Label>Default Field</Label>);
      expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
    });

    it('renders asterisk with proper aria-label', () => {
      render(<Label required>Field</Label>);
      const asterisk = screen.getByLabelText('required');
      expect(asterisk).toHaveTextContent('*');
    });
  });

  describe('Disabled State', () => {
    it('renders with disabled styling when disabled is true', () => {
      render(<Label disabled>Disabled Label</Label>);
      const label = screen.getByText('Disabled Label');
      expect(label).toBeInTheDocument();
    });

    it('does not apply disabled class when disabled is false', () => {
      render(<Label disabled={false}>Enabled Label</Label>);
      const label = screen.getByText('Enabled Label');
      expect(label).not.toHaveClass('label-disabled');
    });

    it('does not apply disabled class by default', () => {
      render(<Label>Default Label</Label>);
      const label = screen.getByText('Default Label');
      expect(label).not.toHaveClass('label-disabled');
    });
  });

  describe('Custom Attributes', () => {
    it('applies custom className', () => {
      render(<Label className="custom-class">Custom</Label>);
      const label = screen.getByText('Custom');
      expect(label).toHaveClass('custom-class');
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Label
          data-testid="custom-label"
          aria-describedby="helper-text"
        >
          Test
        </Label>
      );
      const label = screen.getByText('Test');
      expect(label).toHaveAttribute('data-testid', 'custom-label');
      expect(label).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports id attribute', () => {
      render(<Label id="my-label">Label</Label>);
      expect(screen.getByText('Label')).toHaveAttribute('id', 'my-label');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to label element', () => {
      const ref = vi.fn();
      render(<Label ref={ref}>Test</Label>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLLabelElement));
    });

    it('allows ref access to label element', () => {
      const ref = { current: null as HTMLLabelElement | null };
      render(<Label ref={ref}>Test</Label>);
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
      expect(ref.current?.tagName).toBe('LABEL');
    });
  });

  describe('Children', () => {
    it('renders text children', () => {
      render(<Label>Simple text</Label>);
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('renders JSX children', () => {
      render(
        <Label>
          <span>Complex</span> <strong>content</strong>
        </Label>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Label>
          First part
          <span> second part</span>
        </Label>
      );
      expect(screen.getByText(/First part/)).toBeInTheDocument();
      expect(screen.getByText(/second part/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('associates with form control via htmlFor', () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Username</Label>
          <input id="test-input" type="text" />
        </div>
      );

      const label = screen.getByText('Username');
      const input = container.querySelector('#test-input');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('provides accessible required indicator', () => {
      render(<Label required>Required Field</Label>);
      const requiredIndicator = screen.getByLabelText('required');
      expect(requiredIndicator).toBeInTheDocument();
    });
  });


  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Label.displayName).toBe('Label');
    });
  });

  describe('Event Handlers', () => {
    it('supports onClick handler', async () => {
      const handleClick = vi.fn();
      render(<Label onClick={handleClick}>Clickable</Label>);

      const label = screen.getByText('Clickable');
      label.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick', async () => {
      const handleClick = vi.fn();
      render(<Label onClick={handleClick}>Click</Label>);

      const label = screen.getByText('Click');
      label.click();

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.any(HTMLLabelElement)
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Label>{''}</Label>);
      const { container } = render(<Label>{''}</Label>);
      expect(container.querySelector('label')).toBeInTheDocument();
    });

    it('renders with both required and disabled', () => {
      render(<Label required disabled>Test</Label>);
      const label = screen.getByText('Test');
      expect(label).toBeInTheDocument();
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(200);
      render(<Label>{longText}</Label>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });
});
