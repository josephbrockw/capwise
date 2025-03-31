import React from 'react';
import PropTypes from 'prop-types';
import { useToast, POSITIONS } from './ToastContext';
import Toast from './Toast';
import './Toast.css';

/**
 * Container component that displays all active toasts
 * @returns {JSX.Element} Toast container
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || POSITIONS.BOTTOM_LEFT;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div key={position} className={`toast-container toast-${position}`} data-cy="toast-container">
          {positionToasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              data-cy={toast.dataCy}
              className={`toast-position-${position}`}
            />
          ))}
        </div>
      ))}
    </>
  );
};

ToastContainer.propTypes = {};

export default ToastContainer;
