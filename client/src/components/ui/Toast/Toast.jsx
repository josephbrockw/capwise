import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

const Toast = ({
  message,
  type = 'normal',
  duration = 3000,
  onClose,
  className = '',
  'data-cy': dataCy
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    if (onClose && !isClosing) {
      setIsClosing(true);
      onClose();
    }
  };

  return (
    <div
      className={`toast toast-${type} ${className}`}
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
