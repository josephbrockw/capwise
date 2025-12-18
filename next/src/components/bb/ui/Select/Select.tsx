'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  [key: string]: unknown;
}

export interface SelectProps<T = string | number> {
  id: string;
  name: string;
  label?: string;
  value?: T;
  onChange: (event: { target: { name: string; value: T } }) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  debounceTime?: number;
}

export function Select<T = string | number>({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error = '',
  disabled = false,
  className = '',
  debounceTime = 0
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Toggle dropdown
  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  // Handle option selection
  const handleSelectOption = useCallback((option: SelectOption<T>) => {
    const event = {
      target: {
        name,
        value: option.value
      }
    };

    if (debounceTime > 0) {
      setTimeout(() => onChange(event), debounceTime);
    } else {
      onChange(event);
    }

    setIsOpen(false);
  }, [name, onChange, debounceTime]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  }, [disabled, isOpen]);

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
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

      <div
        id={id}
        className={`relative w-full px-3 py-2 text-sm border rounded-input transition-all cursor-pointer
          bg-surface text-text
          ${error
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-hover' : 'hover:border-border-hover'}
          focus:outline-none
          flex items-center justify-between gap-2`}
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={`${id}-select`}
      >
        <span className={!selectedOption ? 'text-text-muted' : ''}>
          {displayText}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            d="M5.5 7.5l4.5 4.5 4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          id={`${id}-listbox`}
          className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-input shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={`${id}-option-${index}`}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors
                  ${option.value === value
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-text hover:bg-surface-hover'
                  }`}
                onClick={() => handleSelectOption(option)}
                role="option"
                aria-selected={option.value === value}
                data-testid={`${id}-option-${String(option.label).replace(/\s/g, '-')}`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-text-muted">
              No options available
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value !== undefined ? String(value) : ''}
        required={required}
      />

      {error && (
        <div className="mt-1 text-sm text-danger-500" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

Select.displayName = 'Select';
