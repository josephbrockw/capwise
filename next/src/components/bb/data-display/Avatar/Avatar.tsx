import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  rounded?: boolean;
  fallback?: ReactNode;
  color?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      rounded = true,
      fallback,
      color,
      className = '',
      ...props
    },
    ref
  ) => {
    const showImage = !!src;
    const showInitials = !src && name;
    const showFallback = !src && !name;

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center justify-center flex-shrink-0
          ${sizeClasses[size]}
          ${rounded ? 'rounded-full' : 'rounded-lg'}
          ${showInitials ? (color || getColorFromName(name!)) : showFallback ? 'bg-zinc-200 dark:bg-zinc-700' : ''}
          ${className}
        `}
        {...props}
      >
        {showImage && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={`w-full h-full object-cover ${rounded ? 'rounded-full' : 'rounded-lg'}`}
          />
        )}
        {showInitials && (
          <span className="font-medium text-white">{getInitials(name!)}</span>
        )}
        {showFallback && (
          fallback || (
            <svg className="w-1/2 h-1/2 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  children: ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, size = 'md', children, className = '', ...props }, ref) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max ? Math.max(0, childArray.length - max) : 0;

    return (
      <div
        ref={ref}
        className={`flex -space-x-2 ${className}`}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="ring-2 ring-white dark:ring-zinc-900 rounded-full">
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`
              inline-flex items-center justify-center flex-shrink-0
              ${sizeClasses[size]}
              rounded-full bg-zinc-200 dark:bg-zinc-700
              ring-2 ring-white dark:ring-zinc-900
              font-medium text-zinc-600 dark:text-zinc-300
            `}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
