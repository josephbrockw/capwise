'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/bb/layout';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  logoHref?: string;
  children?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      logo,
      logoHref = '/',
      children,
      actions,
      sticky = false,
      transparent = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        className={`
          ${sticky ? 'sticky top-0 z-50' : ''}
          ${transparent ? '' : 'border-b border-border bg-surface'}
          ${className}
        `}
        {...props}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              {logo && (
                <Link
                  href={logoHref}
                  className="text-xl font-bold text-text hover:text-text-secondary transition-colors"
                >
                  {logo}
                </Link>
              )}
              {children && (
                <div className="hidden md:flex items-center gap-1">
                  {children}
                </div>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-4">
                {actions}
              </div>
            )}
          </div>
        </Container>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';
