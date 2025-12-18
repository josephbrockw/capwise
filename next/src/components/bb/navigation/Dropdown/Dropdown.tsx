'use client';

import { HTMLAttributes, forwardRef, ReactNode, useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  items?: DropdownItem[];
}

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'trigger' | number;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      items,
      align = 'left',
      width = 'auto',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }, []);

    const handleEscape = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveSubmenu(null);
        triggerRef.current?.focus();
      }
    }, []);

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, handleClickOutside, handleEscape]);

    const handleItemClick = (item: DropdownItem) => {
      if (item.disabled) return;

      if (item.items) {
        setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
      } else {
        if (item.onClick) item.onClick();
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    const widthStyle = typeof width === 'number' ? { width: `${width}px` } : {};

    const renderItem = (item: DropdownItem) => {
      if (item.divider) {
        return <div key={item.id} className="my-1 border-t border-border" />;
      }

      const hasSubmenu = item.items && item.items.length > 0;
      const isSubmenuOpen = activeSubmenu === item.id;

      const itemContent = (
        <span className="flex items-center gap-2 flex-1">
          {item.icon}
          {item.label}
        </span>
      );

      const itemClasses = `
        w-full flex items-center justify-between px-3 py-2 text-sm text-left
        transition-colors rounded
        ${item.disabled
          ? 'opacity-50 cursor-not-allowed text-text-muted'
          : 'text-text hover:bg-surface-hover cursor-pointer'
        }
      `;

      if (item.href && !item.disabled) {
        return (
          <a
            key={item.id}
            href={item.href}
            className={itemClasses}
            onClick={() => {
              setIsOpen(false);
              setActiveSubmenu(null);
            }}
          >
            {itemContent}
          </a>
        );
      }

      return (
        <div key={item.id} className="relative">
          <button
            type="button"
            className={itemClasses}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {itemContent}
            {hasSubmenu && (
              <svg
                className={`w-4 h-4 text-text-muted transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {hasSubmenu && isSubmenuOpen && (
            <div className="pl-4 mt-1 space-y-1">
              {item.items!.map((subItem) => renderItem(subItem))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div ref={containerRef} className={`relative inline-block ${className}`} {...props}>
        <div
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="inline-flex items-center cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {trigger}
        </div>

        {isOpen && (
          <div
            ref={ref}
            role="menu"
            className={`
              absolute z-50 mt-2 py-2 px-1 min-w-[180px]
              bg-surface border border-border rounded-lg shadow-lg
              ${align === 'right' ? 'right-0' : 'left-0'}
              ${width === 'trigger' ? 'w-full' : ''}
            `}
            style={widthStyle}
          >
            {items.map((item) => renderItem(item))}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
