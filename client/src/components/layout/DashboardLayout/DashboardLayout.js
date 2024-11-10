// components/layout/DashboardLayout/DashboardLayout.js
import React from 'react';
import PropTypes from 'prop-types';
import MenuBar from '../../ui/MenuBar/MenuBar';
import Sidebar from '../../ui/Sidebar/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, showSidebar }) => {
  const menuItems = [];  // Add MenuBar items
  const sidebarItems = [
    'Overview',
    'Reports',
    'Account',
  ];  // Add Sidebar items

  return (
    <div className="dashboard-layout">
      {/* Header Section */}
      <div className="dashboard-header">
        {/* Header content */}
        <MenuBar menuItems={menuItems} />
      </div>

      {/* Body Section */}
      <div className="dashboard-body">
        {showSidebar && <Sidebar isVisible={showSidebar} items={sidebarItems} />}
        <div className={`dashboard-content ${showSidebar ? 'with-sidebar' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
};

DashboardLayout.defaultProps = {
  showSidebar: false,
};

export default DashboardLayout;
