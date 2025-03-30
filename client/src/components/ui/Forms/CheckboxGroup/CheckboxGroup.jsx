import React from 'react';
import PropTypes from 'prop-types';
import './CheckboxGroup.css';

/**
 * CheckboxGroup component for displaying a group of checkboxes
 * Supports sequential selection (filling from left to right)
 *
 * @param {Object} props Component props
 * @param {number} props.value Current value (number of checked boxes)
 * @param {number} props.maxValue Maximum number of checkboxes to display
 * @param {Function} props.onChange Callback when value changes
 * @param {string} props.className Additional CSS class
 * @param {string} props.name Name attribute for the checkbox group
 * @param {boolean} props.disabled Whether the checkboxes are disabled
 */
const CheckboxGroup = ({
  value = 0,
  maxValue = 3,
  onChange,
  className = '',
  name = '',
  disabled = false
}) => {
  // Render checkboxes
  const renderCheckboxes = () => {
    const checkboxes = [];

    for (let i = 1; i <= maxValue; i++) {
      const isChecked = value >= i;

      checkboxes.push(
        <div
          key={`${name}-${i}`}
          className={`checkbox-group-item ${isChecked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => {
            if (disabled) return;

            // If this checkbox is already checked and the next one isn't,
            // clicking it should uncheck it (set value to i-1)
            // Otherwise, clicking it should check it and all previous ones (set value to i)
            const newValue = isChecked && (i === value) ? i - 1 : i;
            onChange && onChange(newValue);
          }}
          aria-checked={isChecked}
          role="checkbox"
          tabIndex={disabled ? '-1' : '0'}
          data-cy={`${name}-checkbox-${i}`}
          aria-disabled={disabled}
        >
          {isChecked && <i className="pi pi-check checkbox-icon"></i>}
        </div>
      );
    }

    return checkboxes;
  };

  return (
    <div className={`checkbox-group ${className}`} role="group" aria-label={name}>
      {renderCheckboxes()}
    </div>
  );
};

CheckboxGroup.propTypes = {
  value: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool
};

export default CheckboxGroup;
