import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-surface-elevated border border-border rounded-card shadow-sm p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
