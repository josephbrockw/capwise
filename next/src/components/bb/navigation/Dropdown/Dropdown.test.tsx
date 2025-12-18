import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';

const mockItems = [
  { id: 'item1', label: 'Item 1', onClick: vi.fn() },
  { id: 'item2', label: 'Item 2', href: '/page2' },
  { id: 'divider', label: '', divider: true },
  { id: 'item3', label: 'Item 3', disabled: true },
];

describe('Dropdown', () => {
  describe('Rendering', () => {
    it('renders trigger', () => {
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('does not show menu initially', () => {
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Opening/Closing', () => {
    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes menu when trigger is clicked again', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));
      await user.click(screen.getByText('Open Menu'));

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Dropdown trigger={<span>Open Menu</span>} items={mockItems} />
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByText('Open Menu'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.click(screen.getByText('Outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes menu on Escape key', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Menu items', () => {
    it('renders all menu items', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('calls onClick when item is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const items = [{ id: 'item1', label: 'Click Me', onClick: handleClick }];
      render(<Dropdown trigger={<span>Open Menu</span>} items={items} />);

      await user.click(screen.getByText('Open Menu'));
      await user.click(screen.getByText('Click Me'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('closes menu after clicking an item', async () => {
      const user = userEvent.setup();
      const items = [{ id: 'item1', label: 'Click Me', onClick: vi.fn() }];
      render(<Dropdown trigger={<span>Open Menu</span>} items={items} />);

      await user.click(screen.getByText('Open Menu'));
      await user.click(screen.getByText('Click Me'));

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders link items', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByRole('link', { name: 'Item 2' })).toHaveAttribute('href', '/page2');
    });
  });

  describe('Disabled items', () => {
    it('renders disabled items with disabled styling', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByText('Item 3').closest('button')).toBeDisabled();
    });
  });

  describe('Alignment', () => {
    it('aligns left by default', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByRole('menu')).toHaveClass('left-0');
    });

    it('aligns right when specified', async () => {
      const user = userEvent.setup();
      render(<Dropdown trigger={<span>Open Menu</span>} items={mockItems} align="right" />);

      await user.click(screen.getByText('Open Menu'));

      expect(screen.getByRole('menu')).toHaveClass('right-0');
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Dropdown.displayName).toBe('Dropdown');
    });
  });
});
