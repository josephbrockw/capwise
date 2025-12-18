import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Toast, ToastProvider, useToast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders message', () => {
      render(<Toast id="1" message="Test message" onClose={() => {}} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with alert role', () => {
      render(<Toast id="1" message="Test" onClose={() => {}} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Type variants', () => {
    it('applies info type by default', () => {
      render(<Toast id="1" message="Test" onClose={() => {}} data-testid="toast" />);
      expect(screen.getByTestId('toast')).toHaveClass('bg-primary-500');
    });

    it('applies success type', () => {
      render(<Toast id="1" message="Test" type="success" onClose={() => {}} data-testid="toast" />);
      expect(screen.getByTestId('toast')).toHaveClass('bg-success-500');
    });

    it('applies error type', () => {
      render(<Toast id="1" message="Test" type="error" onClose={() => {}} data-testid="toast" />);
      expect(screen.getByTestId('toast')).toHaveClass('bg-danger-500');
    });

    it('applies warning type', () => {
      render(<Toast id="1" message="Test" type="warning" onClose={() => {}} data-testid="toast" />);
      expect(screen.getByTestId('toast')).toHaveClass('bg-warning-500');
    });
  });

  describe('Auto-close', () => {
    it('calls onClose after duration', () => {
      const onClose = vi.fn();
      render(<Toast id="1" message="Test" duration={3000} onClose={onClose} />);

      act(() => {
        vi.advanceTimersByTime(3000 + 200);
      });

      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('does not auto-close when duration is 0', () => {
      const onClose = vi.fn();
      render(<Toast id="1" message="Test" duration={0} onClose={onClose} />);

      vi.advanceTimersByTime(10000);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Close button', () => {
    it('calls onClose when close button is clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Toast id="test-id" message="Test" onClose={onClose} duration={0} />);

      await user.click(screen.getByRole('button', { name: /close/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('test-id');
      });
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Toast ref={ref} id="1" message="Test" onClose={() => {}} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Toast.displayName).toBe('Toast');
    });
  });
});

describe('ToastProvider', () => {
  const TestComponent = () => {
    const { success, error, warning, info } = useToast();
    return (
      <div>
        <button onClick={() => success('Success!')}>Show Success</button>
        <button onClick={() => error('Error!')}>Show Error</button>
        <button onClick={() => warning('Warning!')}>Show Warning</button>
        <button onClick={() => info('Info!')}>Show Info</button>
      </div>
    );
  };

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('provides toast context to children', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleError.mockRestore();
  });
});
