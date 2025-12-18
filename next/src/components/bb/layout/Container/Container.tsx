import { HTMLAttributes, forwardRef } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  default: 'max-w-screen-lg',
  lg: 'max-w-screen-xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
} as const;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'default', centered = true, className = '', children, ...props }, ref) => {
    const classes = [
      'w-full px-4',
      sizeClasses[size],
      centered && 'mx-auto',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
