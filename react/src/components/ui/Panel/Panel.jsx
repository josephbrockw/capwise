import { useState } from 'react';
import PropTypes from 'prop-types';
import './Panel.css';

const Panel = ({ header, children, className = '', defaultCollapsed = false, highlighted = false, dataCyNamespace = '', ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bb-panel ${className}`} {...props}>
      <div className={`bb-panel-header ${highlighted ? 'highlighted' : ''}`} onClick={toggleCollapse} data-cy={`${dataCyNamespace}-header`}>
        <div className="bb-panel-title">{header}</div>
        <button
          className={`bb-panel-toggle ${isCollapsed ? 'collapsed' : ''}`}
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L2 5h8l-4 4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className={`bb-panel-content ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  header: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  defaultCollapsed: PropTypes.bool,
  highlighted: PropTypes.bool
};

export default Panel;
