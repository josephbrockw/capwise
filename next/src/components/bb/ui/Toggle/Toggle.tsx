'use client';

import { forwardRef, InputHTMLAttributes, ChangeEvent } from 'react';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  id: string;
  name: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      id,
      name,
      label,
      checked,
      onChange,
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked, e);
      }
    };

    // Only pass checked if it's explicitly provided (controlled mode)
    const inputProps = checked !== undefined ? { checked } : {};

    return (
      <label
        htmlFor={id}
        className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none py-2 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${className}`}
      >
        {label && (
          <span className="text-sm text-zinc-900 dark:text-zinc-100 flex-1">
            {label}
          </span>
        )}
        <div className="relative w-11 h-6 flex-shrink-0">
          <input
            ref={ref}
            id={id}
            name={name}
            type="checkbox"
            {...inputProps}
            onChange={handleChange}
            disabled={disabled}
            className="peer sr-only"
            role="switch"
            aria-checked={checked ?? false}
            {...rest}
          />
          <div
            className={`absolute inset-0 rounded-full transition-colors ${
              checked
                ? 'bg-primary-500'
                : 'bg-zinc-300 dark:bg-zinc-600'
            } peer-focus:ring-2 peer-focus:ring-primary-500/20`}
            aria-hidden="true"
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
