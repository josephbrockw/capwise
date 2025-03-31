import React from 'react';
import { useToast, POSITIONS, TYPES } from './ToastContext';
import Button from '../Button/Button.jsx';

/**
 * Example component demonstrating how to use the Toast system
 * @returns {JSX.Element} Example component
 */
const ToastExample = () => {
  // Get toast methods from the useToast hook
  const { addToast, success, error, normal } = useToast();

  // Example handlers for different toast types
  const handleNormalToast = () => {
    normal('This is a normal toast message');
  };

  const handleSuccessToast = () => {
    success('Operation completed successfully!');
  };

  const handleErrorToast = () => {
    error('An error occurred. Please try again.');
  };

  // Example with custom options
  const handleCustomToast = () => {
    addToast({
      message: 'Custom toast with different position and longer duration',
      type: TYPES.NORMAL,
      position: POSITIONS.TOP_RIGHT,
      duration: 5000
    });
  };

  // Example showing multiple toasts
  const handleMultipleToasts = () => {
    normal('First notification');
    setTimeout(() => {
      success('Second notification', { position: POSITIONS.TOP_LEFT });
    }, 300);
    setTimeout(() => {
      error('Third notification', { position: POSITIONS.BOTTOM_RIGHT });
    }, 600);
  };

  return (
    <div className="toast-example">
      <h2>Toast Examples</h2>
      <div className="button-group">
        <Button onClick={handleNormalToast}>Normal Toast</Button>
        <Button onClick={handleSuccessToast}>Success Toast</Button>
        <Button onClick={handleErrorToast}>Error Toast</Button>
        <Button onClick={handleCustomToast}>Custom Toast</Button>
        <Button onClick={handleMultipleToasts}>Multiple Toasts</Button>
      </div>
    </div>
  );
};

export default ToastExample;
