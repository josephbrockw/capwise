import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './Table';

const mockColumns = [
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'role', label: 'Role' },
];

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor' },
];

describe('Table', () => {
  describe('Rendering', () => {
    it('renders table with headers', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('renders table with data rows', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('renders empty message when no data', () => {
      render(<Table columns={mockColumns} data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders custom empty message', () => {
      render(<Table columns={mockColumns} data={[]} emptyMessage="Nothing to show" />);
      expect(screen.getByText('Nothing to show')).toBeInTheDocument();
    });
  });

  describe('Custom render', () => {
    it('uses custom render function for column', () => {
      const columnsWithRender = [
        { field: 'name', label: 'Name', render: (value: unknown) => <strong>{String(value)}</strong> },
        { field: 'email', label: 'Email' },
      ];
      render(<Table columns={columnsWithRender} data={mockData} />);
      const strongElements = document.querySelectorAll('strong');
      expect(strongElements.length).toBe(3);
    });
  });

  describe('Row click', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={handleRowClick} />);

      await user.click(screen.getByText('John Doe'));

      expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0);
    });
  });

  describe('Sorting', () => {
    it('sorts data when sortable column header is clicked', async () => {
      const user = userEvent.setup();
      const sortableColumns = [
        { field: 'name', label: 'Name', sortable: true },
        { field: 'email', label: 'Email' },
      ];
      render(<Table columns={sortableColumns} data={mockData} sortable />);

      await user.click(screen.getByText('Name'));

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Wilson');
    });

    it('shows sort indicator on sorted column', async () => {
      const user = userEvent.setup();
      const sortableColumns = [
        { field: 'name', label: 'Name', sortable: true },
      ];
      render(<Table columns={sortableColumns} data={mockData} sortable data-testid="table" />);

      const header = screen.getByText('Name').closest('th');
      expect(header?.querySelectorAll('svg').length).toBe(1);

      await user.click(screen.getByText('Name'));
      expect(header?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Styling variants', () => {
    it('applies striped styling', () => {
      render(<Table columns={mockColumns} data={mockData} striped data-testid="table" />);
      const container = screen.getByTestId('table');
      expect(container).toBeInTheDocument();
    });

    it('applies compact styling', () => {
      render(<Table columns={mockColumns} data={mockData} compact data-testid="table" />);
      const table = screen.getByTestId('table').querySelector('table');
      expect(table).toHaveClass('text-sm');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Table columns={mockColumns} data={mockData} className="custom-class" data-testid="table" />);
      expect(screen.getByTestId('table')).toHaveClass('custom-class');
    });
  });
});
