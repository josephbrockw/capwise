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
  secondary: 'bg-surface hover:bg-surface-hover active:opacity-90 text-text border-2 border-border hover:border-border-hover',
  light: 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white',
  ghost: 'bg-transparent hover:bg-surface-hover active:opacity-80 text-text border-2 border-border hover:border-border-hover',
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

    const baseClasses = `inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-button font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[color:var(--focus-ring-color)] focus:ring-offset-[length:var(--focus-ring-offset)] ${variantClasses} ${
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
