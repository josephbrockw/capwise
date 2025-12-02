import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Drawer.css';

/**
 * Drawer component that can be expanded/collapsed to reveal content
 * Shows only a centered arrow when collapsed
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to display inside the drawer
 * @param {string} props.className Additional CSS class
 * @param {string} props.title Optional title for the drawer (only shown when open)
 * @param {boolean} props.defaultOpen Whether the drawer should be open by default
 * @param {string} props.dataCy Data attribute for testing
 */
const Drawer = ({
  children,
  className = '',
  title,
  defaultOpen = false,
  dataCy = 'drawer'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`drawer ${className} ${isOpen ? 'open' : 'closed'}`} data-cy={dataCy}>
      <div className="drawer-toggle-container" onClick={toggleDrawer}>
        <div className="drawer-toggle">
          <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
        </div>
      </div>

      {isOpen && title && (
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
        </div>
      )}

      <div className="drawer-content">
        {children}
      </div>
    </div>
  );
};

Drawer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  defaultOpen: PropTypes.bool,
  dataCy: PropTypes.string
};

export default Drawer;
