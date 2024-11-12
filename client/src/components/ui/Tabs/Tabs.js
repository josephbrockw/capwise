// components/ui/Tabs/Tabs.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id); // Default to the first tab

  return (
    <div className="tabs-container">
      <div className="tabs-header" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tabs-content">
        {tabs.map((tab) =>
          activeTab === tab.id ? (
            <div key={tab.id} className="tab-panel">
              {tab.content}
            </div>
          ) : null
        )}
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
