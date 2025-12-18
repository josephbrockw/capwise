import PropTypes from 'prop-types';
import './Divider.css';

const Divider = ({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  ...props
}) => {
  const classes = [
    'bb-divider',
    `bb-divider--${orientation}`,
    `bb-divider--spacing-${spacing}`,
    className
  ].filter(Boolean).join(' ');

  return <hr className={classes} {...props} />;
};

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  spacing: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Divider;
