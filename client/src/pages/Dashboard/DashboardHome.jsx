import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card/Card';
import Panel from '../../components/ui/Panel/Panel';
import Button from '../../components/ui/Button/Button';
import Chart from '../../components/ui/Chart/Chart';
import { CardSkeleton, ChartPanelSkeleton } from '../../components/ui/Skeleton/Skeleton';
import DevTools from '../../components/DevTools/DevTools';
import { useAuthStore } from '../../stores';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API after component mounts
    const fetchData = async () => {
      const user = await useAuthStore.getState().fetchUserData();
      setUserData(user);
      setIsLoading(false);
    };

    fetchData();
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

  const devTriggers = [
    {
      label: `Loading State: ${isLoading ? 'On' : 'Off'}`,
      onClick: () => setIsLoading(!isLoading),
      active: isLoading
    }
  ];

  return (
    <DashboardLayout showSidebar={true}>
      {/* Development only - loading toggle button */}
      {import.meta.env.DEV && (
        <DevTools triggers={devTriggers} />
      )}

      {isLoading ? (
        <div className="dashboard-loading">
          <CardSkeleton style={{ marginBottom: '2em' }} />
          <ChartPanelSkeleton />
        </div>
      ) : (
        <div>
          <Card title="Welcome to Your Dashboard" style={{marginBottom: '2em'}}>
            <p>This is your project dashboard, where you can see your usage and manage your account.</p>
            <Button label="Get Started" icon="pi pi-arrow-right"/>
          </Card>

          {chartData && (
            <Panel header="Usage Statistics" style={{ marginBottom: '2em' }}>
              <Chart type="line" data={chartData} />
            </Panel>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
