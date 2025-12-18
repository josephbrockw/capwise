import PropTypes from 'prop-types';
import './Container.css';

const Container = ({
  children,
  size = 'default',
  centered = true,
  className = '',
  ...props
}) => {
  const classes = [
    'bb-container',
    `bb-container--${size}`,
    centered && 'bb-container--centered',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl', 'full']),
  centered: PropTypes.bool,
  className: PropTypes.string,
};

export default Container;
