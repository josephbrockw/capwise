import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * LoadingSpinner component displays a loading indicator with an optional message
 *
 * @param {Object} props
 * @param {string} props.message - Optional message to display under the spinner
 * @param {string} props.className - Additional CSS class
 * @param {string} props.size - Size of the spinner: 'small', 'medium', or 'large'
 */
const LoadingSpinner = ({ message, className = '', size = 'medium' }) => {
  return (
    <div className={`loading-spinner-container ${className} ${size}`}>
      <div className="loading-spinner">
        <div className="spinner-animation"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LoadingSpinner;
