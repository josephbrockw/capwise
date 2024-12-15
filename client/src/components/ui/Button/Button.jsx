// Button.js
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  label,
  icon,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`custom-button ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      aria-disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {icon && <i className={`icon ${icon}`}></i>}
      {label}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Button;
