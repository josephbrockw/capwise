'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
}

const variantClasses = {
  default: 'bg-surface border border-border',
  outlined: 'bg-transparent border-2 border-border',
  elevated: 'bg-surface shadow-lg border border-border/50',
} as const;

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      header,
      footer,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="px-6 py-4 border-b border-border">
            {header}
          </div>
        )}
        <div className={paddingClasses[padding]}>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-surface-hover/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between ${className}`}
        {...props}
      >
        <div>
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';
