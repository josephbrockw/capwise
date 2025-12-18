import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { Button } from '@/components/bb/ui';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const defaultIcon = (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon = defaultIcon,
      title = 'No data',
      message,
      actionLabel,
      onAction,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          flex flex-col items-center justify-center py-12 px-4 text-center
          ${className}
        `}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-text-muted">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
        )}
        {message && (
          <p className="text-sm text-text-muted max-w-sm mb-4">{message}</p>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
