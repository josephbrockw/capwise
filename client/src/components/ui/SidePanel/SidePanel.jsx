import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button.jsx';
import './SidePanel.css';

/**
 * SidePanel component for displaying content in a slide-in panel from the side of the screen
 *
 * @param {Object} props Component props
 * @param {ReactNode} props.children Content to display in the panel
 * @param {string} props.title Panel title
 * @param {function} props.onClose Function to call when panel is closed
 * @param {string} props.className Additional CSS class names
 * @param {string} props.position Position of the panel ('right' or 'left')
 * @param {Object} props.headerActions Additional actions to display in the header
 */
const SidePanel = ({
  children,
  title,
  onClose,
  className = '',
  position = 'right',
  headerActions,
  ...rest
}) => {
  return (
    <div className="side-panel-container" {...rest}>
      <div className="side-panel-overlay" onClick={onClose}></div>
      <div className={`side-panel ${position} ${className}`}>
        <div className="side-panel-header">
          <h3 className="side-panel-title">{title}</h3>
          <div className="side-panel-header-actions">
            {headerActions}
            <Button
              icon="pi pi-times"
              className="button-text button-rounded"
              onClick={onClose}
              aria-label="Close panel"
            />
          </div>
        </div>
        <div className="side-panel-content">
          {children}
        </div>
      </div>
    </div>
  );
};

SidePanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  position: PropTypes.oneOf(['right', 'left']),
  headerActions: PropTypes.node
};

export default SidePanel;
