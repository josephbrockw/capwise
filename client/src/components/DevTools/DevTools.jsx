import { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card/Card';
import Toggle from '../ui/Toggle/Toggle';
import './DevTools.css';

const DevTools = ({ triggers = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className={`dev-tools ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="dev-tools-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse dev tools' : 'Expand dev tools'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
        >
          <path
            d="M7.5 4.5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="dev-tools-content">
        <Card title="Dev Tools">
          <div className="dev-tools-body">
            {triggers.map((trigger, index) => (
              <Toggle
                key={index}
                label={trigger.label}
                checked={trigger.active}
                onChange={trigger.onClick}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

DevTools.propTypes = {
  triggers: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      active: PropTypes.bool.isRequired
    })
  )
};

export default DevTools;
