import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SimpleSelect.css';

const SimpleSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  optionLabelKey = 'name',
  optionValueKey = 'id',
  placeholder = 'Select an option',
  required = false,
  error = '',
  disabled = false,
  debounceTime = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(option => option[optionValueKey] === value);
  const displayText = selectedOption ? selectedOption[optionLabelKey] : placeholder;

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  // Handle option selection
  const handleSelectOption = (option) => {
    const optionValue = option[optionValueKey];

    const event = {
      target: {
        name,
        value: optionValue
      }
    };

    if (debounceTime > 0) {
      setTimeout(() => onChange(event), debounceTime);
    } else {
      onChange(event);
    }

    setIsOpen(false);
  };

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(option =>
        option[optionLabelKey].toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="simple-select-wrapper" ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="simple-select-label">
          {label}
          {required && <span className="simple-select-required">*</span>}
        </label>
      )}

      <div
        className={`simple-select-control ${isOpen ? 'open' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggleDropdown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? id : undefined}
        data-cy={`${id}-simple-select`}
      >
        <div className="simple-select-spacer"></div>
        <div className="simple-select-value">{displayText}</div>
        <div className="simple-select-arrow">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path
              d={isOpen ? "M14.5 13.5l-4.5-4.5-4.5 4.5" : "M5.5 7.5l4.5 4.5 4.5-4.5"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="simple-select-dropdown" role="listbox">
          {options.length > 0 ? (
            <>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`simple-select-option ${option[optionValueKey] === value ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(option)}
                    role="option"
                    aria-selected={option[optionValueKey] === value}
                    data-cy={`${id}-simple-select-option-${String(option[optionLabelKey]).replace(/\s/g, '')}`}
                  >
                    {option[optionLabelKey]}
                  </div>
                ))
              ) : (
                <div className="simple-select-empty">No matching options</div>
              )}
            </>
          ) : (
            <div className="simple-select-empty">No options available</div>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ''}
        required={required}
      />

      {error && <div className="simple-select-error">{error}</div>}
    </div>
  );
};

SimpleSelect.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  optionLabelKey: PropTypes.string,
  optionValueKey: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  debounceTime: PropTypes.number
};

export default SimpleSelect;
