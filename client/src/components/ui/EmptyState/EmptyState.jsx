import React from 'react';
import PropTypes from 'prop-types';
import './EmptyState.css';

/**
 * EmptyState component displays a message when there's no data to show
 *
 * @param {Object} props
 * @param {string} props.title - The title to display
 * @param {string} props.message - The message to display
 * @param {string} props.icon - The icon class (PrimeIcons) to display
 * @param {string} props.actionLabel - Label for the action button
 * @param {Function} props.onAction - Callback for when the action button is clicked
 * @param {string} props.className - Additional CSS class
 */
const EmptyState = ({
  title,
  message,
  icon = 'pi pi-info-circle',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <i className={`empty-state-icon ${icon}`}></i>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {message && <p className="empty-state-message">{message}</p>}
      {actionLabel && onAction && (
        <button className="button-primary empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string
};

export default EmptyState;
