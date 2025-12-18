'use client';

import { HTMLAttributes, forwardRef, useId } from 'react';
import { Label } from '@/components/bb/ui';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = htmlFor || generatedId;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {label && (
          <Label htmlFor={fieldId} required={required} disabled={disabled}>
            {label}
          </Label>
        )}
        {children}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-danger-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
