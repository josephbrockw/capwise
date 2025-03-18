import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TextField.css';

/**
 * TextField component for text input with configurable height
 *
 * @param {Object} props Component props
 * @param {string} props.id Unique identifier for the input
 * @param {string} props.name Name attribute for the input
 * @param {string} props.label Label text
 * @param {string} props.value Current value
 * @param {function} props.onChange Change handler function
 * @param {string} props.placeholder Placeholder text
 * @param {boolean} props.required Whether the field is required
 * @param {string} props.error Error message to display
 * @param {number} props.rows Number of rows for textarea (default: 3)
 * @param {string} props.className Additional CSS class
 * @param {Object} props.style Additional inline styles
 * @param {boolean} props.disabled Whether the field is disabled
 * @param {boolean} props.multiline Whether to render as textarea instead of input
 * @param {number} props.debounceTime Time in ms to debounce the onChange event (default: 0, no debounce)
 */
const TextField = ({
  id,
  name,
  label,
  value = '',
  onChange,
  placeholder = '',
  required = false,
  error = '',
  rows = 3,
  className = '',
  style = {},
  disabled = false,
  multiline = false,
  debounceTime = 0,
  ...rest
}) => {
  // Internal state for debounced input
  const [internalValue, setInternalValue] = useState(value);

  // Update internal value when prop value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    (() => {
      let timeout;
      return (e) => {
        const newValue = e.target.value;
        setInternalValue(newValue);

        if (debounceTime > 0) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (onChange) {
              onChange({
                ...e,
                target: {
                  ...e.target,
                  name: name,
                  value: newValue
                }
              });
            }
          }, debounceTime);
        } else {
          if (onChange) {
            onChange(e);
          }
        }
      };
    })(),
    [onChange, debounceTime, name]
  );

  const inputClasses = [
    'text-field-input',
    error ? 'text-field-error' : '',
    className
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    const commonProps = {
      id,
      name,
      value: internalValue,
      onChange: debouncedOnChange,
      placeholder,
      disabled,
      required,
      className: inputClasses,
      style,
      ...rest
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          rows={rows}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type="text"
      />
    );
  };

  return (
    <div className="text-field-container">
      {label && (
        <label htmlFor={id} className="text-field-label">
          {label}
          {required && <span className="text-field-required">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <div className="text-field-error-message">{error}</div>}
    </div>
  );
};

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  debounceTime: PropTypes.number
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(TextField);
