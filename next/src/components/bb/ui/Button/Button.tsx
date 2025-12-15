import { ButtonHTMLAttributes, HTMLAttributes, forwardRef, MouseEvent } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'light' | 'ghost';
  tag?: 'button' | 'div';
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

type DivProps = HTMLAttributes<HTMLDivElement>;

const variantStyles = {
  primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-600 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500',
  light: 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 text-zinc-900 dark:text-zinc-100',
  ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500',
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      label,
      icon,
      variant = 'primary',
      tag = 'button',
      type = 'button',
      fullWidth = false,
      disabled = false,
      className = '',
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = variantStyles[variant];

    const baseClasses = `inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/30 ${variantClasses} ${
      fullWidth ? 'w-full' : ''
    } ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`;

    const handleClick = (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (onClick) {
        onClick(e as MouseEvent<HTMLButtonElement>);
      }
    };

    const content = (
      <>
        {icon && <i className={`icon ${icon}`}></i>}
        {children || label}
      </>
    );

    if (tag === 'div') {
      const divProps = props as unknown as DivProps;
      const divClickHandler = (e: MouseEvent<HTMLDivElement>) => {
        handleClick(e as unknown as MouseEvent<HTMLButtonElement>);
      };
      return (
        <div
          className={`${baseClasses} ${className}`}
          aria-disabled={disabled}
          onClick={divClickHandler}
          tabIndex={0}
          {...divProps}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type={type as 'button' | 'submit' | 'reset'}
        className={`${baseClasses} ${className}`}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
