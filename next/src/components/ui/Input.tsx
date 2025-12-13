import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-zinc-900 dark:text-white mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`input-field w-full ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
