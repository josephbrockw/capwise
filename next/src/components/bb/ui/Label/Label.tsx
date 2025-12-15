import { LabelHTMLAttributes, forwardRef } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      htmlFor,
      required = false,
      disabled = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-6 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${className}`}
        {...rest}
      >
        {children}
        {required && (
          <span className="ml-1 text-danger-500 font-semibold" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
