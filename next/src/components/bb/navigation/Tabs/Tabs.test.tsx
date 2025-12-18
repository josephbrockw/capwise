import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Tabs, TabPanel } from './Tabs';

const mockTabs = [
  { id: 'tab1', label: 'Tab 1' },
  { id: 'tab2', label: 'Tab 2' },
  { id: 'tab3', label: 'Tab 3' },
];

describe('Tabs', () => {
  describe('Rendering', () => {
    it('renders all tabs', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={() => {}} />);
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('renders tablist', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={() => {}} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    it('sets aria-selected on active tab', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab2" onChange={() => {}} />);
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Tab change', () => {
    it('calls onChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={handleChange} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('does not call onChange when disabled tab is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const tabsWithDisabled = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
      ];
      render(<Tabs tabs={tabsWithDisabled} activeTab="tab1" onChange={handleChange} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('applies line variant by default', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={() => {}} data-testid="tabs" />);
      expect(screen.getByTestId('tabs')).toHaveClass('border-b');
    });

    it('applies pills variant', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={() => {}} variant="pills" data-testid="tabs" />);
      expect(screen.getByTestId('tabs')).toHaveClass('rounded-lg');
    });
  });

  describe('With icons', () => {
    it('renders tab icons', () => {
      const tabsWithIcons = [
        { id: 'tab1', label: 'Tab 1', icon: <span data-testid="icon">🏠</span> },
      ];
      render(<Tabs tabs={tabsWithIcons} activeTab="tab1" onChange={() => {}} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Tabs.displayName).toBe('Tabs');
    });
  });
});

describe('TabPanel', () => {
  describe('Rendering', () => {
    it('renders content when active', () => {
      render(
        <TabPanel tabId="tab1" activeTab="tab1">
          Panel content
        </TabPanel>
      );
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('does not render content when inactive', () => {
      render(
        <TabPanel tabId="tab1" activeTab="tab2">
          Panel content
        </TabPanel>
      );
      expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
    });

    it('has tabpanel role', () => {
      render(
        <TabPanel tabId="tab1" activeTab="tab1">
          Panel content
        </TabPanel>
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <TabPanel ref={ref} tabId="tab1" activeTab="tab1">
          Content
        </TabPanel>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(TabPanel.displayName).toBe('TabPanel');
    });
  });
});
