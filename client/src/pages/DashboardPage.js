import React from 'react';

const DashboardPage = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
};

export default DashboardPage;
