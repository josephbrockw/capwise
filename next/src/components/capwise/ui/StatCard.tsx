'use client';

import { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, subtext, icon, trend }: StatCardProps) {
  return (
    <div className="flex items-center gap-4" data-testid="stat-card">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/20"
        data-testid="stat-icon"
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-text-muted" data-testid="stat-label">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-text" data-testid="stat-value">{value}</p>
          {trend && (
            <span
              className={`text-xs ${trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-danger-500' : 'text-text-muted'}`}
              data-testid="stat-trend"
            >
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-text-muted" data-testid="stat-subtext">{subtext}</p>}
      </div>
    </div>
  );
}
