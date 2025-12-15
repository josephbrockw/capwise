'use client';

import { forwardRef, InputHTMLAttributes, ChangeEvent } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  id: string;
  name: string;
  label?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      name,
      label,
      checked,
      onChange,
      error,
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    // Only pass checked if it's explicitly provided (controlled mode)
    const inputProps = checked !== undefined ? { checked } : {};

    return (
      <div className={className}>
        <label
          htmlFor={id}
          className={`inline-flex items-center gap-2 cursor-pointer select-none ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={id}
              name={name}
              type="checkbox"
              {...inputProps}
              onChange={onChange}
              disabled={disabled}
              className="peer sr-only"
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              {...rest}
            />
            <div
              className={`w-5 h-5 border-2 rounded transition-all ${
                error
                  ? 'border-danger-500'
                  : 'border-zinc-300 dark:border-zinc-600'
              } ${
                disabled
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'bg-white dark:bg-zinc-900'
              } peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20`}
              aria-hidden="true"
            >
              {checked && (
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-full h-full text-white p-0.5"
                >
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                </svg>
              )}
            </div>
          </div>
          {label && (
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              {label}
            </span>
          )}
        </label>
        {error && (
          <div
            id={`${id}-error`}
            className="mt-1 text-sm text-danger-500"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
