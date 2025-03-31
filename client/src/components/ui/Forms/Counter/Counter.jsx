import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../Button/Button';
import './Counter.css';

/**
 * Counter component for incrementing and decrementing numeric values
 * Displays a value with + and - buttons on either side
 *
 * @param {Object} props Component props
 * @param {number} props.value Current value of the counter
 * @param {number} props.minValue Minimum allowed value (default: 0)
 * @param {number} props.maxValue Maximum allowed value (default: Infinity)
 * @param {Function} props.onChange Callback when value changes
 * @param {string} props.className Additional CSS class
 * @param {string} props.name Name attribute for the counter
 * @param {boolean} props.disabled Whether the counter is disabled
 * @param {string} props.label Optional label to display between buttons
 */
const Counter = ({
  value = 0,
  minValue = 0,
  maxValue = Infinity,
  onChange,
  className = '',
  name = '',
  disabled = false,
  label = ''
}) => {
  // Ensure we have a valid number
  const currentValue = Number(value) || 0;

  // Handle increasing the value
  const handleIncrease = () => {
    if (currentValue < maxValue && !disabled) {
      onChange && onChange(currentValue + 1);
    }
  };

  // Handle decreasing the value
  const handleDecrease = () => {
    if (currentValue > minValue && !disabled) {
      onChange && onChange(currentValue - 1);
    }
  };

  return (
    <div className={`counter ${className}`} data-cy={`counter-${name}`}>
      <Button
        onClick={handleDecrease}
        disabled={currentValue <= minValue || disabled}
        icon="pi pi-minus"
        className="counter-button counter-decrease no-icon-margin"
        aria-label={`Decrease ${name}`}
        label=""
      />
      <div className="counter-display">
        <span className="counter-value">{currentValue}</span>
        {label && <span className="counter-label">{label}</span>}
      </div>
      <Button
        onClick={handleIncrease}
        disabled={currentValue >= maxValue || disabled}
        icon="pi pi-plus"
        className="counter-button counter-increase no-icon-margin"
        aria-label={`Increase ${name}`}
        label=""
      />
    </div>
  );
};

Counter.propTypes = {
  value: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

export default Counter;
