import React from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../components/elements/Navigation';

function Dashboard({ isAuthenticated, logOut }) {
  if (!isAuthenticated) {
    return <Navigate to='/log-in' />;
  }
  return (
    <>
      <Navigation isAuthenticated={isAuthenticated} logOut={logOut} />
      <div>
        <h1>Dashboard</h1>
      </div>
    </>
  );
}

export default Dashboard;
