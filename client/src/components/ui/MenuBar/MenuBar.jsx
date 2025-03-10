// components/MenuBar/MenuBar.js
import React from 'react';
import PropTypes from 'prop-types';
import LogoutButton from '../../LogoutButton';
import MobileMenuDropdown from "../MobileMenuDropdown/MobileMenuDropdown";
import { Link } from 'react-router-dom';
import './MenuBar.css';
import inlineLogoWhite from '../../../assets/images/inlineLogoWhite.png';

const MenuBar = ({ menuItems, isMobile }) => {
  return (
    <div className="menu-bar">
      <div className="menu-bar-logo">
        <Link to="/">
          <img src={inlineLogoWhite} alt="Logo" />
        </Link>
      </div>
      {isMobile ? (
        <MobileMenuDropdown menuItems={menuItems} />
      ): (
        <div className="menu-bar-items">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="menu-bar-link"
              data-cy={`${item.label.toLowerCase()}-link`}
            >
              {item.label}
            </a>
          ))}
          <LogoutButton />
        </div>
      )}
    </div>
  );
};

MenuBar.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MenuBar;
