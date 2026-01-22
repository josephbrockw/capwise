'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import config from '@/config';
import { AppLayout } from '@/components/capwise/layout';

export default function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { userTeams, currentTeam, setCurrentTeam, isCommissioner } = useTeam();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(config.navigation.login);
    }
  }, [user, authLoading, router]);

  const teams = userTeams.map((t) => ({ id: t.id, name: t.name }));

  return (
    <AppLayout
      teams={teams}
      currentTeamId={currentTeam?.id}
      onTeamChange={setCurrentTeam}
      isCommissioner={isCommissioner}
    >
      {children}
    </AppLayout>
  );
}
