'use client';

import { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
