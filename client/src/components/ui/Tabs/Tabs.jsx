import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id); // Default to the first tab

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const tabIndex = tabs.findIndex((tab) => tab.id === hash);
    if (tabIndex >= 0) {
      setActiveTab(tabIndex);
    } else {
      setActiveTab(0)
    }
  }, [tabs]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    window.history.replaceState(null, '', `#${tabs[index].id}`);
  }

  return (
    <div className="tabs-container">
      <div className="tabs-header" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            className={`tab-item ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tabs-content">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={index !== activeTab}
            className={`tab-panel ${index === activeTab ? 'visible' : ''}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
};

export default Tabs;
