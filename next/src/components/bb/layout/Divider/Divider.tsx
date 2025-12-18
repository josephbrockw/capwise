import { HTMLAttributes, forwardRef } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  horizontal: {
    none: 'my-0',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
  },
  vertical: {
    none: 'mx-0',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
  },
} as const;

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', spacing = 'md', className = '', ...props }, ref) => {
    const isVertical = orientation === 'vertical';

    const classes = [
      'border-none bg-border',
      isVertical ? 'w-px h-full self-stretch' : 'w-full h-px',
      spacingClasses[orientation][spacing],
      className,
    ].filter(Boolean).join(' ');

    return <hr ref={ref} className={classes} {...props} />;
  }
);

Divider.displayName = 'Divider';
