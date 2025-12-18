import { HTMLAttributes, forwardRef } from 'react';

export type SkeletonVariant = 'text' | 'title' | 'circular' | 'rectangular' | 'button';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantClasses = {
  text: 'h-4 rounded',
  title: 'h-6 rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
  button: 'h-10 rounded-lg',
} as const;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rectangular', width, height, className = '', style, ...props }, ref) => {
    const dimensionStyle = {
      ...style,
      width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
      <div
        ref={ref}
        className={`
          bg-zinc-200 dark:bg-zinc-700 animate-pulse
          ${variantClasses[variant]}
          ${className}
        `}
        style={dimensionStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Preset skeleton components
export type CardSkeletonProps = HTMLAttributes<HTMLDivElement>;

export const CardSkeleton = forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-4 rounded-xl border border-border bg-surface ${className}`}
        {...props}
      >
        <Skeleton variant="title" width="60%" className="mb-3" />
        <Skeleton variant="text" width="100%" className="mb-2" />
        <Skeleton variant="text" width="90%" className="mb-4" />
        <Skeleton variant="button" width={120} />
      </div>
    );
  }
);

CardSkeleton.displayName = 'CardSkeleton';

export interface TableRowSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

export const TableRowSkeleton = forwardRef<HTMLDivElement, TableRowSkeletonProps>(
  ({ columns = 4, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-4 py-3 ${className}`}
        {...props}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
    );
  }
);

TableRowSkeleton.displayName = 'TableRowSkeleton';

export interface AvatarSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
} as const;

export const AvatarSkeleton = forwardRef<HTMLDivElement, AvatarSkeletonProps>(
  ({ size = 'md', className = '', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        className={`${avatarSizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

AvatarSkeleton.displayName = 'AvatarSkeleton';
