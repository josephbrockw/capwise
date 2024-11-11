import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import LogoutButton from '../../LogoutButton';
import './MobileMenuDropdown.css';

const MobileMenuDropdown = ({ menuItems }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [activeItem, setActiveItem] = useState(null); // For tiered menu interaction
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
      setActiveItem(null); // Reset active item
    }
  };

  useEffect(() => {
    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible]);

  const handleItemClick = (item) => {
    if (item.items) {
      setActiveItem((prev) => (prev === item ? null : item)); // Toggle submenu
    } else {
      setDropdownVisible(false);
      setActiveItem(null);
    }
  };

  return (
    <div className="mobile-menu-dropdown" ref={dropdownRef}>
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
            <div key={index} className="mobile-menu-dropdown-item">
              <div
                className={`dropdown-menu-item ${activeItem === item ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
                {item.items && (
                  <i
                    className={`pi ${
                      activeItem === item ? 'pi-angle-up' : 'pi-angle-down'
                    } submenu-icon`}
                  ></i>
                )}
              </div>
              {item.items && activeItem === item && (
                <div className={`submenu ${activeItem == item ? 'visible' : ''}`}>
                  {item.items.map((subItem, subIndex) => (
                    <a
                      key={subIndex}
                      href={subItem.href}
                      className="submenu-item"
                      data-cy={`${subItem.label.toLowerCase()}-link`}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={"mobile-menu-dropdown-item"}>
            <LogoutButton className="mobile-menu-dropdown-item logout" />
          </div>
        </div>
      )}
    </div>
  );
};

MobileMenuDropdown.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          href: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default MobileMenuDropdown;
