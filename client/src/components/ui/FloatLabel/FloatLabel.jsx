import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FloatLabel.css';

const FloatLabel = ({ id, label, value, onChange, type = 'text', name, required = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Check if the label should float
  const isFloating = isFocused || (value && value.trim() !== '');

  return (
    <div className={`float-label-container ${isFloating ? 'floating' : ''}`}>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="float-label-input"
        required={required}
        {...props}
      />
      <label htmlFor={id} className="float-label">
        {label}
      </label>
    </div>
  );
};

FloatLabel.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

export default FloatLabel;
