import React from 'react';
import Navigation from './elements/Navigation';

function Dashboard(props) {
  return (
    <>
      <Navigation isAuthenticated={props.isAuthenticated} />
      <div>
        <h1>Dashboard</h1>
      </div>
    </>
  );
}

export default Dashboard;