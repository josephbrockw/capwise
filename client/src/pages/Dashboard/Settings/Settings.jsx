import { useEffect, useState } from 'react';
import { CardSkeleton } from '../../../components/ui/Skeleton/Skeleton';
import 'chart.js/auto';
import { useAuthStore } from '../../../stores';
import DashboardLayout from '../../../components/layout/DashboardLayout/DashboardLayout';
import Tabs from '../../../components/ui/Tabs/Tabs';
import AccountTab from './Tabs/AccountTab/AccountTab';
import BillingTab from './Tabs/BillingTab/BillingTab';

const Settings = () => {
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

  const tabs = [
    { id: 'account', label: 'Account', content: <AccountTab /> },
    { id: 'billing', label: 'Billing', content: <BillingTab /> },
  ];

  return (
    <DashboardLayout showSidebar={true}>
      {isLoading ? (
        <div className="dashboard-loading">
          <CardSkeleton style={{ marginBottom: '2em' }} />
          <CardSkeleton />
        </div>
      ) : (
        <div>
          <h1>Settings</h1>
          <Tabs tabs={tabs} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
