'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';
import { AppLayout } from '@/components/capwise/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(config.navigation.login);
    }
  }, [user, isLoading, router]);

  return (
    <AppLayout
      teams={[]}
      currentTeamId={undefined}
      onTeamChange={() => {}}
      isCommissioner={false}
    >
      {children}
    </AppLayout>
  );
}
