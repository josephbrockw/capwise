import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FloatLabel.css'; // Custom styles

const FloatLabel = ({ id, label, value, onChange, type = "text", name, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={`custom-float-label ${isFocused || value ? 'focused' : ''}`}>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="custom-input"
        required={required}
      />
      <label htmlFor={id} className="custom-label">
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
