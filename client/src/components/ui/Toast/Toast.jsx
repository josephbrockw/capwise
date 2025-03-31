import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

/**
 * Toast notification component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} [props.type='normal'] - Toast type (success, error, normal)
 * @param {number} [props.duration=3000] - Duration in milliseconds
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props['data-cy']] - Cypress test attribute
 * @returns {JSX.Element} Toast component
 */
const Toast = ({
  message,
  type = 'normal',
  duration = 3000,
  onClose,
  className = '',
  'data-cy': dataCy
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    if (onClose && !isClosing) {
      setIsClosing(true);
      // Add a small delay before calling onClose to allow for exit animation
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`toast toast-${type} ${isClosing ? 'toast-closing' : ''} ${className}`}
      role="alert"
      data-cy={dataCy}
    >
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {onClose && (
          <button
            className="toast-close"
            onClick={handleClose}
            aria-label="Close message"
            data-cy={`${dataCy}-close`}
            disabled={isClosing}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'normal']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string,
  'data-cy': PropTypes.string
};

export default Toast;
