import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import LogoutButton from '../../LogoutButton';
import './MobileMenuDropdown.css';

const MobileMenuDropdown = ({ menuItems }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dorpdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dorpdownRef.current && !dorpdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible]);

  return (
    <div className="mobile-menu-dropdown" ref={dorpdownRef}>
      <button
        className="mobile-menu-icon"
        onClick={toggleDropdown}
        aria-label="User menu"
      >
        <i className="pi pi-user" style={{ fontSize: '1.5rem' }}></i>
      </button>
      {isDropdownVisible && (
        <div className="mobile-menu-dropdown-menu">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="mobile-menu-dropdown-item"
              data-cy={`${item.label.toLowerCase()}-link`}
            >
              {item.label}
            </a>
          ))}
          <LogoutButton className="mobile-menu-dropdown-item logout" />
        </div>
      )}
    </div>
  );
};

MobileMenuDropdown.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MobileMenuDropdown;
