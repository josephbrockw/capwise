// Button.js
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  label,
  icon,
  onClick,
  tag,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const finalTag = tag || 'button';

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
  };

  if (finalTag=== 'div') {
    return (
      <div
        className={`custom-button ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''} ${className}`}
        aria-disabled={disabled}
        onClick={handleClick}
        tabIndex={0}
        {...props}
      >
        {icon && <i className={`icon ${icon}`}></i>}
        {label}
      </div>
    )
  }

  return (
    <button
      type={type}
      className={`custom-button ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      aria-disabled={disabled}
      disabled={disabled}
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
  tag: PropTypes.oneOf(['button', 'div']),
};

export default Button;
