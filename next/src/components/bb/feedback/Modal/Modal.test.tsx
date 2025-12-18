import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Modal } from './Modal';

describe('Modal', () => {
  describe('Rendering', () => {
    it('renders nothing when open is false', () => {
      render(<Modal open={false} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders content when open is true', () => {
      render(<Modal open={true} onClose={() => {}}>Modal content</Modal>);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders with dialog role', () => {
      render(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Title', () => {
    it('renders title when provided', () => {
      render(<Modal open={true} onClose={() => {}} title="Modal Title">Content</Modal>);
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('does not render title element when not provided', () => {
      render(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <Modal open={true} onClose={() => {}} footer={<button>Save</button>}>
          Content
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('does not render footer section when not provided', () => {
      const { container } = render(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(container.querySelector('.border-t')).not.toBeInTheDocument();
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose}>Content</Modal>);

      await user.click(screen.getByRole('button', { name: /close modal/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on escape key when dismissable', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose} dismissable={true}>Content</Modal>);

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on escape key when not dismissable', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose} dismissable={false}>Content</Modal>);

      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Size variants', () => {
    it('applies md size by default', () => {
      render(<Modal open={true} onClose={() => {}} data-testid="modal">Content</Modal>);
      expect(screen.getByTestId('modal')).toHaveClass('max-w-md');
    });

    it('applies sm size', () => {
      render(<Modal open={true} onClose={() => {}} size="sm" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId('modal')).toHaveClass('max-w-sm');
    });

    it('applies lg size', () => {
      render(<Modal open={true} onClose={() => {}} size="lg" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId('modal')).toHaveClass('max-w-lg');
    });

    it('applies xl size', () => {
      render(<Modal open={true} onClose={() => {}} size="xl" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId('modal')).toHaveClass('max-w-xl');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Modal open={true} onClose={() => {}} className="custom-class" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId('modal')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to modal container', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Modal ref={ref} open={true} onClose={() => {}}>Content</Modal>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Modal.displayName).toBe('Modal');
    });
  });
});
