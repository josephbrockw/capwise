import PropTypes from 'prop-types';
import './Toggle.css';

const Toggle = ({ label, checked, onChange, className = '' }) => {
  return (
    <label className={`toggle-switch ${className}`}>
      <div className="toggle-label">{label}</div>
      <div className="toggle-container">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </div>
    </label>
  );
};

Toggle.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Toggle;
