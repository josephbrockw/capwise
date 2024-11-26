// components/layout/DashboardLayout/DashboardLayout.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MenuBar from '../../ui/MenuBar/MenuBar';
import Sidebar from '../../ui/Sidebar/Sidebar';
import './DashboardLayout.css';
import useIsMobile from '../../../hooks/useIsMobile';
import config from '../../../config';

const DashboardLayout = ({ children }) => {
  const showSidebar = config.showSidebar;
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const isMobile = useIsMobile();

  const menuItems = [
    {
      label: 'Settings',
      href: '/settings',
      items: [
        { label: 'Profile', href: '/settings#account' },
        { label: 'Billing', href: '/settings#billing' },
      ],
    },
  ];  // Add MenuBar items
  const sidebarItems = [
    'Overview',
    'Reports',
    'Account',
  ];  // Add Sidebar items

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const closeSidebar = () => setSidebarVisible(false);

  return (
    <div className="dashboard-layout">
      {/* Header Section */}
      <div className="dashboard-header">
        {/* Header content */}
        {showSidebar && isMobile && (
          <button className="sidebar-toggle" onClick={toggleSidebar} data-cy="sidebar-toggle">
            <i className="pi pi-bars" style={{ color: 'var(--menuBarTextColor, white)' }} />
          </button>
        )}
        <MenuBar menuItems={menuItems} isMobile={isMobile} />
      </div>

      {/* Body Section */}
      <div className="dashboard-body">
        <Sidebar
          isVisible={isSidebarVisible}
          items={sidebarItems}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        <div className={`dashboard-content ${showSidebar && !isMobile ? 'with-sidebar' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

DashboardLayout.defaultProps = {
  showSidebar: false,
};

export default DashboardLayout;
