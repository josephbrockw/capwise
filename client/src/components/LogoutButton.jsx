// client/src/components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storageHelper } from '../utils/apiInit';
import Button from './ui/Button/Button';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storageHelper.logout();
    navigate('/login');
  };

  return (
    <Button label="Logout" className="logout-button" onClick={handleLogout} data-cy="logout-button" />
  );
};

export default LogoutButton;
