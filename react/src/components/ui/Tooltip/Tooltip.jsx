import React from 'react';
import PropTypes from 'prop-types';
import './Tooltip.css';

/**
 * Tooltip component that displays additional information on hover
 */
const Tooltip = ({ content, className = '' }) => {
  return (
    <div className={`bb-tooltip ${className}`}>
      <span
        className="bb-tooltip-trigger"
        aria-label="More information"
      >
        ?
        <div className="bb-tooltip-content">
          {content}
        </div>
      </span>
    </div>
  );
};

Tooltip.propTypes = {
  /** Content to display in the tooltip */
  content: PropTypes.node.isRequired,
  /** Additional CSS class names */
  className: PropTypes.string
};

export default Tooltip;
