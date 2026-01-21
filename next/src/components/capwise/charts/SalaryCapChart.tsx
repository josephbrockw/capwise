'use client';

import { formatCurrency } from '@/utils/format';

export interface SalaryCapChartProps {
  used: number;
  total: number;
}

export function SalaryCapChart({ used, total }: SalaryCapChartProps) {
  const percentage = (used / total) * 100;
  const remaining = total - used;
  const isOverCap = used > total;

  return (
    <div className="space-y-3" data-testid="salary-cap-chart">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-text" data-testid="used-amount">
            {formatCurrency(used)}
          </p>
          <p className="text-sm text-text-muted">of {formatCurrency(total)} cap</p>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-semibold ${isOverCap ? 'text-danger-500' : 'text-success-500'}`}
            data-testid="remaining-amount"
          >
            {formatCurrency(Math.abs(remaining))}
          </p>
          <p className="text-sm text-text-muted" data-testid="cap-status">
            {isOverCap ? 'over cap' : 'cap space'}
          </p>
        </div>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverCap ? 'bg-danger-500' : percentage > 90 ? 'bg-warning-500' : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          data-testid="progress-bar"
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        {percentage > 75 && percentage <= 100 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-warning-600"
            style={{ left: '90%' }}
            title="Luxury tax threshold"
            data-testid="luxury-tax-marker"
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
