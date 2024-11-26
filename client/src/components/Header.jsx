import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <nav role="navigation">
      <ul>
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
        <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
        <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
      </ul>
    </nav>
  );
}

export default Header;
