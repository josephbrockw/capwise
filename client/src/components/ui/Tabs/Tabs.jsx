import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

/**
 * Tabs component for creating tabbed interfaces
 *
 * @param {Object} props Component props
 * @param {Array} props.tabs Array of tab objects with id and label
 * @param {string} props.activeTab ID of the currently active tab
 * @param {Function} props.onTabChange Callback when tab is changed
 * @param {node} props.children Content to be displayed in the tab panels
 * @param {string} props.className Additional CSS class
 */
const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = ''
}) => {
  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-header" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            className={`tab-item ${tab.id === activeTab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            data-cy={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tabs-content">
        {children}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Tabs;
