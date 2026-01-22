'use client';

import { formatCurrency } from '@/utils/format';

export interface SalaryCapBarProps {
  currentSalary: number;
  salaryCap: number;
  showDetails?: boolean;
}

export function SalaryCapBar({
  currentSalary,
  salaryCap,
  showDetails = true,
}: SalaryCapBarProps) {
  const percentage = (currentSalary / salaryCap) * 100;
  const capSpace = salaryCap - currentSalary;
  const isOverCap = currentSalary > salaryCap;

  return (
    <div className="space-y-2" data-testid="salary-cap-bar">
      {showDetails && (
        <div className="flex justify-between text-sm">
          <span className="text-text-muted" data-testid="salary-label">
            Salary: <span className="text-text font-medium">{formatCurrency(currentSalary)}</span>
          </span>
          <span
            className={`font-medium ${isOverCap ? 'text-danger-500' : 'text-success-500'}`}
            data-testid="cap-space-label"
          >
            {isOverCap ? '-' : '+'}{formatCurrency(Math.abs(capSpace))}
          </span>
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOverCap
              ? 'bg-danger-500'
              : percentage > 90
              ? 'bg-warning-500'
              : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          data-testid="progress-bar"
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Salary cap usage: ${Math.round(percentage)}%`}
        />
      </div>
      {showDetails && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>Cap: {formatCurrency(salaryCap)}</span>
          <span data-testid="percentage-label">{Math.round(percentage)}% used</span>
        </div>
      )}
    </div>
  );
}
