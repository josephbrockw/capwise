// client/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import storageHelper from '../utils/storageHelper';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API after component mounts
    const fetchUserData = async () => {
      const user = await storageHelper.getUserData();
      setUserData(user);
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
