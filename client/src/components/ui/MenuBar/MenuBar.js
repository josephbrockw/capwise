// components/MenuBar/MenuBar.js
import React from 'react';
import PropTypes from 'prop-types';
// import LogoutButton from '../../LogoutButton/LogoutButton';
import LogoutButton from '../../LogoutButton';
import Button from '../../Button/Button';
import { Link } from 'react-router-dom';
import './MenuBar.css';
import inlineLogo from '../../../assets/images/inlineLogo.png';

const MenuBar = ({ menuItems, onLogout }) => {
  return (
    <div className="menu-bar">
      <div className="menu-bar-logo">
        <Link to="/dashboard">
          <img src={inlineLogo} alt="Logo" />
        </Link>
      </div>
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
        <Button
          label="Account"
          icon="pi pi-user"
          className="p-button-text menu-bar-button"
          onClick={() => console.log('Account clicked')} // Replace with account action
          data-cy="account-button"
        />
        <LogoutButton />
      </div>
    </div>
  );
};

MenuBar.propTypes = {
  logoSrc: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default MenuBar;
