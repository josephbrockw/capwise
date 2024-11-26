// Button.js
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ label, icon, className = '', fullWidth = false, disabled = false, ...props }) => (
  <button
    className={`custom-button ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''} ${className}`}
    disabled={disabled}
    {...props}
  >
    {icon && <i className={`icon ${icon}`}></i>}
    {label}
  </button>
);

Button.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Button;
