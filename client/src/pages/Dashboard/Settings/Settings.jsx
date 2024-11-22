import React, { useEffect, useState } from 'react';
import { Skeleton } from 'primereact/skeleton';
import 'chart.js/auto';
import storageHelper from '../../../utils/storageHelper';
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
      const user = await storageHelper.getUserData();
      setUserData(user);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'account', label: 'Account', content: <AccountTab /> },
    { id: 'billing', label: 'Billing', content: <BillingTab /> },
  ]

  return (
    <DashboardLayout showSidebar={true}>
      {isLoading ? (
        <div className="dashboard-loading">
          <Skeleton width="100%" height="2em" />
          <Skeleton width="100%" height="20em" />
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
