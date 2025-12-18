'use client';

import { AnchorHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  external?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-surface hover:bg-surface-hover active:opacity-90 text-text border-2 border-border hover:border-border-hover',
  ghost: 'bg-transparent hover:bg-surface-hover active:opacity-80 text-text',
} as const;

const sizeStyles = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-base',
} as const;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      href,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      external = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2 rounded-button font-semibold
      transition-all duration-200 no-underline
      focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[color:var(--focus-ring-color)] focus:ring-offset-[length:var(--focus-ring-offset)]
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
    `;

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={`${baseClasses} ${className}`}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';
