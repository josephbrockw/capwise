// client/src/components/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import storageHelper from '../utils/storageHelper';
import Button from './Button/Button';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storageHelper.logout();
    navigate('/login');
  };

  return (
    <Button label="Logout" onClick={handleLogout} data-cy="logout-button" />
  );
};

export default LogoutButton;
