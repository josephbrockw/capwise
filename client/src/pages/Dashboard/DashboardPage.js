import React, { useEffect, useState, memo } from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import 'chart.js/auto';
import storageHelper from '../../utils/storageHelper';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

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
    <DashboardLayout showSidebar={true}>
      {isLoading ? (
        <div className="dashboard-loading">
          <Skeleton width="100%" height="2em" />
          <Skeleton width="100%" height="20em" />
        </div>
      ) : (
        <div>
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
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
