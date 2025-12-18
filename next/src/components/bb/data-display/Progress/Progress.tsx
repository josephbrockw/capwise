'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
} as const;

const variantClasses = {
  default: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
} as const;

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      animated = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayLabel = label ?? `${Math.round(percentage)}%`;

    return (
      <div ref={ref} className={className} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm text-text-secondary">{displayLabel}</span>
            <span className="text-sm text-text-muted">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={`
            w-full overflow-hidden rounded-full bg-surface-hover
            ${sizeClasses[size]}
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full rounded-full transition-all duration-300 ease-out
              ${variantClasses[variant]}
              ${animated ? 'animate-pulse' : ''}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
