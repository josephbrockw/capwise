// client/src/components/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import storageHelper from '../utils/storageHelper';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storageHelper.logout();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;
