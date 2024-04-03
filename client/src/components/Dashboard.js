import React from 'react';
import Navigation from './elements/Navigation';

function Dashboard({ isAuthenticated, logOut }) {
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