'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';
import { Spinner } from '@/components/bb/feedback';
import { Navbar, Dropdown } from '@/components/bb/navigation';
import { Avatar } from '@/components/bb/data-display';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.name ||
    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null) ||
    user?.first_name ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(config.navigation.login);
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push(config.navigation.home);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Navbar
        logo={config.appName}
        logoHref={config.navigation.dashboard}
        actions={
          <Dropdown
            trigger={
              <Avatar name={displayName} color="bg-secondary-500" size="sm" className="cursor-pointer" />
            }
            items={[
              { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
              { id: 'logout', label: 'Logout', onClick: handleLogout },
            ]}
            align="right"
          />
        }
      >
      </Navbar>

      {children}
    </div>
  );
}
