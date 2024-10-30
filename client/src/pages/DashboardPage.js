// client/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API after component mounts
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <LogoutButton />
      <h1>Dashboard</h1>
      {userData ? (
        <div>
          <p>Welcome, {userData.first_name}!</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
