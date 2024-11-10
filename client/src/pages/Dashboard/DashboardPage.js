import React, { useEffect, useState, memo } from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import 'chart.js/auto';
import MenuBar from '../../components/ui/MenuBar/MenuBar';
import storageHelper from '../../utils/storageHelper';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API after component mounts
    const fetchUserData = async () => {
      const user = await storageHelper.getUserData();
      setUserData(user);
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  // Define the items for the Menubar
  const menuItems = [
  ];


        // Example chart data for a usage chart
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Usage Statistics',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        data: [65, 59, 80, 81, 56],
      },
    ],
  };

  return (
    <div>
      {isLoading ? (
        <div className="dashboard-loading">
          <Skeleton width="100%" height="2em" />
          <Skeleton width="100%" height="20em" />
        </div>
      ) : (
        <div className="dashboard-container">
          <MenuBar menuItems={menuItems} />

          <div className="dashboard-content">
            {/* Sidebar */}
            <div className="sidebar">
              <Panel header="Navigation">
                <ul>
                  <li>Overview</li>
                  <li>Reports</li>
                  <li>Account</li>
                </ul>
              </Panel>
            </div>

            {/* Main Content */}
            <div className="main-content">
              <Card title="Welcome to Your Dashboard" style={{marginBottom: '2em'}}>
                <p>This is your project dashboard, where you can see your usage and manage your account.</p>
                <Button label="Get Started" icon="pi pi-arrow-right"/>
              </Card>

              {chartData && (
                <Panel header="Usage Statistics" style={{ marginBottom: '2em' }}>
                  <Chart type="bar" data={chartData} />
                </Panel>
              )}


              <Card title="Quick Actions" style={{marginBottom: '2em'}}>
                <div className="p-grid">
                  <div className="p-col-12 p-md-4">
                    <Button label="View Reports" icon="pi pi-chart-line" className="p-button-info"/>
                  </div>
                  <div className="p-col-12 p-md-4">
                    <Button label="Manage Account" icon="pi pi-user-edit" className="p-button-warning"/>
                  </div>
                  <div className="p-col-12 p-md-4">
                    <Button label="Settings" icon="pi pi-cog" className="p-button-secondary"/>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
