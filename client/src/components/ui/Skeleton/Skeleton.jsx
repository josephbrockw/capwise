import PropTypes from 'prop-types';
import './Skeleton.css';

const Skeleton = ({ variant = 'rect', className = '', ...props }) => {
  return (
    <div
      className={`bb-skeleton bb-skeleton-${variant} ${className}`}
      {...props}
    />
  );
};

// Predefined skeleton for a card with title, text, and button
const CardSkeleton = ({ className = '', ...props }) => {
  return (
    <div className={`bb-skeleton-card ${className}`} {...props}>
      <Skeleton variant="title" style={{ width: '60%', marginBottom: '1rem' }} />
      <Skeleton variant="text" style={{ width: '100%', marginBottom: '0.5rem' }} />
      <Skeleton variant="text" style={{ width: '90%', marginBottom: '1rem' }} />
      <Skeleton variant="button" style={{ width: '120px' }} />
    </div>
  );
};

// Predefined skeleton for a panel with header and chart
const ChartPanelSkeleton = ({ className = '', ...props }) => {
  return (
    <div className={`bb-skeleton-panel ${className}`} {...props}>
      <Skeleton variant="title" style={{ width: '40%', marginBottom: '1rem' }} />
      <Skeleton variant="chart" style={{ width: '100%', height: '300px' }} />
    </div>
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['rect', 'text', 'title', 'button', 'chart']),
  className: PropTypes.string,
};

CardSkeleton.propTypes = {
  className: PropTypes.string,
};

ChartPanelSkeleton.propTypes = {
  className: PropTypes.string,
};

export { Skeleton, CardSkeleton, ChartPanelSkeleton };
