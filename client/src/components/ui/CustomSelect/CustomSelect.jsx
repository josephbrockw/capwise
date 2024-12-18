import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'primeicons/primeicons.css';
import './CustomSelect.css';
import { capitalize } from '../../../utils/stringMagic';

const CustomSelect = ({ value, onChange, options, defaultValue, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || defaultValue);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange({ target: { value: option } });
  };

  return (
    <div className={`custom-select ${className || ''}`} ref={dropdownRef}>
      <div
        className={`select-header ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        data-cy="select-header"
      >
        <span className="selected-value">{capitalize(selectedOption)}</span>
        <i className={`pi ${isOpen ? 'pi-angle-up' : 'pi-angle-down'}`} />
      </div>
      <div className={`select-dropdown ${isOpen ? 'visible' : ''}`} data-cy="select-dropdown">
        {options.map((option) => (
          <div
            key={option}
            className={`select-option ${option === selectedOption ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick(option);
            }}
            role="option"
            aria-selected={option === selectedOption}
            data-cy={`select-option-${option}`}
          >
            {capitalize(option)}
          </div>
        ))}
      </div>
    </div>
  );
};

CustomSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultValue: PropTypes.string,
  className: PropTypes.string
};

export default CustomSelect;
