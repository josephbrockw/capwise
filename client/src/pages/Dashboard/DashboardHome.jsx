import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card/Card';
import Panel from '../../components/ui/Panel/Panel';
import Button from '../../components/Button/Button';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import 'chart.js/auto';
import storageHelper from '../../utils/storageHelper';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API after component mounts
    const fetchData = async () => {
      const user = await storageHelper.getUserData();
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
