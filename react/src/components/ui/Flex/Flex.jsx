import PropTypes from 'prop-types';
import './Flex.css';

const Flex = ({
  children,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '',
  ...props
}) => {
  const classes = [
    'bb-flex',
    `bb-flex--gap-${gap}`,
    `bb-flex--align-${align}`,
    `bb-flex--justify-${justify}`,
    wrap && 'bb-flex--wrap',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Flex.propTypes = {
  children: PropTypes.node,
  gap: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  wrap: PropTypes.bool,
  className: PropTypes.string,
};

export default Flex;
