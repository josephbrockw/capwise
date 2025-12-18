'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-2.5',
} as const;

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      activeTab,
      onChange,
      variant = 'line',
      size = 'md',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const getTabClasses = (tab: Tab) => {
      const isActive = tab.id === activeTab;
      const isDisabled = tab.disabled;

      const baseClasses = `
        inline-flex items-center justify-center gap-2 font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${fullWidth ? 'flex-1' : ''}
      `;

      if (variant === 'line') {
        return `
          ${baseClasses}
          border-b-2 -mb-px
          ${isActive
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-text-secondary hover:text-text hover:border-border'
          }
        `;
      }

      if (variant === 'pills') {
        return `
          ${baseClasses}
          rounded-lg
          ${isActive
            ? 'bg-primary-500 text-white'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text'
          }
        `;
      }

      if (variant === 'enclosed') {
        return `
          ${baseClasses}
          rounded-t-lg border border-b-0
          ${isActive
            ? 'bg-surface border-border text-text -mb-px'
            : 'bg-transparent border-transparent text-text-secondary hover:text-text'
          }
        `;
      }

      return baseClasses;
    };

    const containerClasses = {
      line: 'border-b border-border',
      pills: 'bg-surface-hover rounded-lg p-1',
      enclosed: 'border-b border-border',
    };

    return (
      <div
        ref={ref}
        className={`${containerClasses[variant]} ${className}`}
        {...props}
      >
        <div
          role="tablist"
          className={`flex ${fullWidth ? 'w-full' : ''} ${variant === 'pills' ? 'gap-1' : ''}`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={tab.id === activeTab}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              className={getTabClasses(tab)}
              onClick={() => !tab.disabled && onChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabId: string;
  activeTab: string;
  children: ReactNode;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ tabId, activeTab, children, className = '', ...props }, ref) => {
    if (tabId !== activeTab) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${tabId}`}
        aria-labelledby={tabId}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';
