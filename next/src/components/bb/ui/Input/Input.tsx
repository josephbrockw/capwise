'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ChangeEvent, useState, useEffect, useCallback } from 'react';

interface BaseInputProps {
  id: string;
  name: string;
  label?: string;
  error?: string;
  helperText?: string;
  debounceTime?: number;
}

interface TextInputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'id' | 'name'> {
  multiline?: false;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'id' | 'name'> {
  multiline: true;
  rows?: number;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export type InputProps = TextInputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const {
      id,
      name,
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      debounceTime = 0,
      multiline = false,
      onChange,
      value: controlledValue = '',
      ...rest
    } = props;

    // Internal state for debounced input
    const [internalValue, setInternalValue] = useState(controlledValue);

    // Update internal value when controlled value changes
    useEffect(() => {
      setInternalValue(controlledValue);
    }, [controlledValue]);

    // Debounced onChange handler
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const debouncedOnChange = useCallback(
      (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);

        if (debounceTime > 0) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (onChange) {
              onChange(e as ChangeEvent<HTMLInputElement> & ChangeEvent<HTMLTextAreaElement>);
            }
          }, debounceTime);
        } else {
          if (onChange) {
            onChange(e as ChangeEvent<HTMLInputElement> & ChangeEvent<HTMLTextAreaElement>);
          }
        }
      },
      [onChange, debounceTime]
    );

    const baseInputClasses = `w-full px-3 py-2 text-sm border rounded-input transition-all
      bg-surface text-text
      placeholder:text-text-muted
      ${error
        ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
        : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
      }
      ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-hover' : ''}
      focus:outline-none
      ${className}`;

    const renderInput = () => {
      if (multiline) {
        const textareaProps = rest as Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>;
        return (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            id={id}
            name={name}
            value={internalValue}
            onChange={debouncedOnChange}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            rows={(props as TextareaProps).rows || 3}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...textareaProps}
          />
        );
      }

      const inputProps = rest as Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;
      return (
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={id}
          name={name}
          type="text"
          value={internalValue}
          onChange={debouncedOnChange}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...inputProps}
        />
      );
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block mb-2 text-sm font-medium text-text">
            {label}
            {required && (
              <span className="ml-1 text-danger-500 font-semibold" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        {renderInput()}
        {error && (
          <div id={`${id}-error`} className="mt-1 text-sm text-danger-500" role="alert">
            {error}
          </div>
        )}
        {helperText && !error && (
          <div id={`${id}-helper`} className="mt-1 text-sm text-text-muted">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
