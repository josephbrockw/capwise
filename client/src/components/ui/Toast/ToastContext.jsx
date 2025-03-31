import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create context for toast management
const ToastContext = createContext(null);

/**
 * Positions for toast notifications
 * @type {Object}
 */
export const POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
};

/**
 * Toast types for styling
 * @type {Object}
 */
export const TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  NORMAL: 'normal',
};

/**
 * Provider component that makes toast functionality available to all children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification
   * @param {Object} toast - Toast configuration
   * @param {string} toast.message - Toast message content
   * @param {string} [toast.type=TYPES.NORMAL] - Toast type (success, error, normal)
   * @param {number} [toast.duration=3000] - Duration in milliseconds
   * @param {string} [toast.position=POSITIONS.BOTTOM_LEFT] - Position on screen
   * @param {string} [toast.dataCy] - Data-cy attribute for testing
   * @returns {string} Unique ID of the created toast
   */
  const addToast = useCallback(({
    message,
    type = TYPES.NORMAL,
    duration = 3000,
    position = POSITIONS.BOTTOM_LEFT,
    'data-cy': dataCy,
  }) => {
    const id = uuidv4();
    const newToast = {
      id,
      message,
      type,
      duration,
      position,
      dataCy: dataCy || `toast-${type}`,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    // Auto-remove toast after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Remove a toast by its ID
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: TYPES.SUCCESS, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: TYPES.ERROR, ...options });
  }, [addToast]);

  const normal = useCallback((message, options = {}) => {
    return addToast({ message, type: TYPES.NORMAL, ...options });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    normal,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Custom hook to use toast functionality
 * @returns {Object} Toast methods and state
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
