import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div>
    <h1>Welcome to BaseBuild</h1>
    <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
  </div>
);

export default LandingPage;
