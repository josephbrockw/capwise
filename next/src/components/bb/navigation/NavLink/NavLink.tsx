'use client';

import { forwardRef, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  exact?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      href,
      children,
      className = '',
      activeClassName = 'text-primary-600 font-semibold',
      inactiveClassName = 'text-text-secondary hover:text-text',
      exact = false,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
      <Link
        ref={ref}
        href={href}
        className={`
          transition-colors duration-200
          ${isActive ? activeClassName : inactiveClassName}
          ${className}
        `}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';
