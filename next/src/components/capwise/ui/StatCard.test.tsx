import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

const MockIcon = () => <svg data-testid="mock-icon" />;

describe('StatCard', () => {
  describe('Rendering', () => {
    it('renders the card', () => {
      render(<StatCard label="Test Label" value="42" icon={<MockIcon />} />);
      expect(screen.getByTestId('stat-card')).toBeInTheDocument();
    });

    it('displays the label', () => {
      render(<StatCard label="Total Points" value="100" icon={<MockIcon />} />);
      expect(screen.getByTestId('stat-label')).toHaveTextContent('Total Points');
    });

    it('displays the value', () => {
      render(<StatCard label="Score" value="85" icon={<MockIcon />} />);
      expect(screen.getByTestId('stat-value')).toHaveTextContent('85');
    });

    it('renders the icon', () => {
      render(<StatCard label="Test" value="1" icon={<MockIcon />} />);
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });
  });

  describe('Subtext', () => {
    it('displays subtext when provided', () => {
      render(<StatCard label="Wins" value="10" subtext="this season" icon={<MockIcon />} />);
      expect(screen.getByTestId('stat-subtext')).toHaveTextContent('this season');
    });

    it('does not render subtext when not provided', () => {
      render(<StatCard label="Wins" value="10" icon={<MockIcon />} />);
      expect(screen.queryByTestId('stat-subtext')).not.toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('shows + for upward trend', () => {
      render(<StatCard label="Points" value="50" trend="up" icon={<MockIcon />} />);
      const trend = screen.getByTestId('stat-trend');
      expect(trend).toHaveTextContent('+');
      expect(trend).toHaveClass('text-success-500');
    });

    it('shows - for downward trend', () => {
      render(<StatCard label="Points" value="50" trend="down" icon={<MockIcon />} />);
      const trend = screen.getByTestId('stat-trend');
      expect(trend).toHaveTextContent('-');
      expect(trend).toHaveClass('text-danger-500');
    });

    it('shows empty for neutral trend', () => {
      render(<StatCard label="Points" value="50" trend="neutral" icon={<MockIcon />} />);
      const trend = screen.getByTestId('stat-trend');
      expect(trend).toHaveTextContent('');
      expect(trend).toHaveClass('text-text-muted');
    });

    it('does not render trend when not provided', () => {
      render(<StatCard label="Points" value="50" icon={<MockIcon />} />);
      expect(screen.queryByTestId('stat-trend')).not.toBeInTheDocument();
    });
  });
});
