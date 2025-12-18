import { HTMLAttributes, forwardRef } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
} as const;

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', label, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={`flex flex-col items-center justify-center gap-2 ${className}`}
        {...props}
      >
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full border-primary-200 border-t-primary-500
            animate-spin
          `}
        />
        {label && (
          <span className={`text-text-muted ${labelSizeClasses[size]}`}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
