// components/ui/Sidebar/Sidebar.js
import React from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

const Sidebar = ({ isVisible, items }) => {
  if (!isVisible) return null;

  return (
    <div className="sidebar-container">
      <ul className="sidebar-list">
        {items.map((item, index) => (
          <li key={index} className="sidebar-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  isVisible: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Sidebar.defaultProps = {
  isVisible: true,
};

export default Sidebar;
