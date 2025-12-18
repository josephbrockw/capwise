import PropTypes from 'prop-types';
import './Stack.css';

const Stack = ({
  children,
  gap = 'md',
  align = 'stretch',
  className = '',
  ...props
}) => {
  const classes = [
    'bb-stack',
    `bb-stack--gap-${gap}`,
    `bb-stack--align-${align}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Stack.propTypes = {
  children: PropTypes.node,
  gap: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  className: PropTypes.string,
};

export default Stack;
