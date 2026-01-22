import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalaryCapBar } from './SalaryCapBar';

describe('SalaryCapBar', () => {
  describe('Rendering', () => {
    it('renders the salary cap bar', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      expect(screen.getByTestId('salary-cap-bar')).toBeInTheDocument();
    });

    it('displays current salary', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      expect(screen.getByTestId('salary-label')).toHaveTextContent('$75,000,000');
    });

    it('displays positive cap space when under cap', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      expect(screen.getByTestId('cap-space-label')).toHaveTextContent('+$25,000,000');
    });

    it('displays negative cap space when over cap', () => {
      render(<SalaryCapBar currentSalary={110000000} salaryCap={100000000} />);
      expect(screen.getByTestId('cap-space-label')).toHaveTextContent('-$10,000,000');
    });

    it('displays percentage used', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      expect(screen.getByTestId('percentage-label')).toHaveTextContent('75% used');
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar with correct width', () => {
      render(<SalaryCapBar currentSalary={50000000} salaryCap={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('caps progress bar at 100% when over cap', () => {
      render(<SalaryCapBar currentSalary={150000000} salaryCap={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('has primary color when under 90%', () => {
      render(<SalaryCapBar currentSalary={50000000} salaryCap={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-primary-500');
    });

    it('has warning color when between 90-100%', () => {
      render(<SalaryCapBar currentSalary={95000000} salaryCap={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-warning-500');
    });

    it('has danger color when over cap', () => {
      render(<SalaryCapBar currentSalary={110000000} salaryCap={100000000} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-danger-500');
    });
  });

  describe('showDetails prop', () => {
    it('shows details by default', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      expect(screen.getByTestId('salary-label')).toBeInTheDocument();
      expect(screen.getByTestId('percentage-label')).toBeInTheDocument();
    });

    it('hides details when showDetails is false', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} showDetails={false} />);
      expect(screen.queryByTestId('salary-label')).not.toBeInTheDocument();
      expect(screen.queryByTestId('percentage-label')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has progressbar role', () => {
      render(<SalaryCapBar currentSalary={50000000} salaryCap={100000000} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has correct aria values', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-label', () => {
      render(<SalaryCapBar currentSalary={75000000} salaryCap={100000000} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Salary cap usage: 75%');
    });
  });
});
