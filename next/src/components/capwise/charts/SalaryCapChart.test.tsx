import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalaryCapChart } from './SalaryCapChart';

describe('SalaryCapChart', () => {
  describe('Rendering', () => {
    it('renders the chart', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      expect(screen.getByTestId('salary-cap-chart')).toBeInTheDocument();
    });

    it('displays used amount', () => {
      render(<SalaryCapChart used={75000000} total={100000000} />);
      expect(screen.getByTestId('used-amount')).toHaveTextContent('$75,000,000');
    });

    it('displays total cap amount', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      expect(screen.getByText('of $100,000,000 cap')).toBeInTheDocument();
    });

    it('displays remaining cap space when under cap', () => {
      render(<SalaryCapChart used={75000000} total={100000000} />);
      expect(screen.getByTestId('remaining-amount')).toHaveTextContent('$25,000,000');
      expect(screen.getByTestId('cap-status')).toHaveTextContent('cap space');
    });

    it('displays over cap amount when over cap', () => {
      render(<SalaryCapChart used={110000000} total={100000000} />);
      expect(screen.getByTestId('remaining-amount')).toHaveTextContent('$10,000,000');
      expect(screen.getByTestId('cap-status')).toHaveTextContent('over cap');
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar with correct width', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('caps progress bar at 100% when over cap', () => {
      render(<SalaryCapChart used={150000000} total={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('has primary color when under 90%', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-primary-500');
    });

    it('has warning color when between 90-100%', () => {
      render(<SalaryCapChart used={95000000} total={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-warning-500');
    });

    it('has danger color when over cap', () => {
      render(<SalaryCapChart used={110000000} total={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-danger-500');
    });
  });

  describe('Luxury Tax Marker', () => {
    it('shows luxury tax marker when between 75-100%', () => {
      render(<SalaryCapChart used={80000000} total={100000000} />);
      expect(screen.getByTestId('luxury-tax-marker')).toBeInTheDocument();
    });

    it('hides luxury tax marker when under 75%', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      expect(screen.queryByTestId('luxury-tax-marker')).not.toBeInTheDocument();
    });

    it('hides luxury tax marker when over 100%', () => {
      render(<SalaryCapChart used={110000000} total={100000000} />);
      expect(screen.queryByTestId('luxury-tax-marker')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has progressbar role', () => {
      render(<SalaryCapChart used={50000000} total={100000000} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has correct aria values', () => {
      render(<SalaryCapChart used={75000000} total={100000000} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
