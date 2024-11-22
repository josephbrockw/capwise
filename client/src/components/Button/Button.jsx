// Button.js
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ label, icon, className = '', fullWidth = false, ...props }) => (
  <button
    className={`custom-button ${fullWidth ? 'full-width' : ''} ${className}`}
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
};

export default Button;
