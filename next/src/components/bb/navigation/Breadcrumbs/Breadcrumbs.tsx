import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  homeIcon?: ReactNode;
  showHome?: boolean;
  homeHref?: string;
}

const defaultSeparator = (
  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const defaultHomeIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      items,
      separator = defaultSeparator,
      homeIcon = defaultHomeIcon,
      showHome = true,
      homeHref = '/',
      className = '',
      ...props
    },
    ref
  ) => {
    const allItems: BreadcrumbItem[] = showHome
      ? [{ label: 'Home', href: homeHref, icon: homeIcon }, ...items]
      : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={`flex items-center ${className}`}
        {...props}
      >
        <ol className="flex items-center gap-2">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center gap-2">
                {!isFirst && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {separator}
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
                  >
                    {item.icon}
                    {!isFirst && item.label}
                  </Link>
                ) : (
                  <span
                    className={`flex items-center gap-1 text-sm ${
                      isLast ? 'text-text font-medium' : 'text-text-secondary'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    {!isFirst && item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
