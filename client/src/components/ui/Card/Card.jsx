import './Card.css';
import PropTypes from 'prop-types';

const Card = ({ title, children, className = '', ...props }) => {
  return (
    <div className={`bb-card ${className}`} {...props}>
      {title && <div className="bb-card-title">{title}</div>}
      <div className="bb-card-content">{children}</div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;
