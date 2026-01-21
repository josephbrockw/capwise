'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { Team, TeamDetail, League, getLeagues, getTeam } from '@/api/league';

const TEAM_ID_STORAGE_KEY = 'capwise_current_team_id';

interface TeamContextValue {
  currentTeam: TeamDetail | null;
  currentLeague: League | null;
  userTeams: Team[];
  userLeagues: League[];
  setCurrentTeam: (teamId: string) => void;
  switchLeague: (leagueId: string) => void;
  isCommissioner: boolean;
  isLoading: boolean;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function getTeamContextId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TEAM_ID_STORAGE_KEY);
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [currentTeam, setCurrentTeamState] = useState<TeamDetail | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userLeagues, setUserLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentLeague = currentTeam?.league ?? null;

  const isCommissioner =
    currentLeague !== null &&
    user !== null &&
    currentLeague.commissioner_id === user.id;

  const fetchTeamDetail = useCallback(
    async (teamId: string): Promise<TeamDetail | null> => {
      try {
        const teamDetail = await getTeam(teamId, teamId);
        return teamDetail;
      } catch (error) {
        console.error('Failed to fetch team detail:', error);
        return null;
      }
    },
    []
  );

  const setCurrentTeam = useCallback(
    async (teamId: string) => {
      localStorage.setItem(TEAM_ID_STORAGE_KEY, teamId);
      const teamDetail = await fetchTeamDetail(teamId);
      if (teamDetail) {
        setCurrentTeamState(teamDetail);
      }
    },
    [fetchTeamDetail]
  );

  const switchLeague = useCallback(
    (leagueId: string) => {
      const teamInLeague = userTeams.find(
        (t) => userLeagues.find((l) => l.id === leagueId)?.id === leagueId
      );
      if (teamInLeague) {
        setCurrentTeam(teamInLeague.id);
      }
    },
    [userTeams, userLeagues, setCurrentTeam]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCurrentTeamState(null);
      setUserTeams([]);
      setUserLeagues([]);
      setIsLoading(false);
      return;
    }

    const loadTeamsAndLeagues = async () => {
      setIsLoading(true);
      try {
        const leagues = await getLeagues();
        setUserLeagues(leagues);

        const allTeams: Team[] = [];
        for (const league of leagues) {
          const storedTeamId = localStorage.getItem(TEAM_ID_STORAGE_KEY);
          if (storedTeamId) {
            try {
              const teamDetail = await getTeam(storedTeamId, storedTeamId);
              if (teamDetail) {
                allTeams.push({
                  id: teamDetail.id,
                  name: teamDetail.name,
                  abbreviation: teamDetail.abbreviation,
                  owner_id: teamDetail.owner_id,
                  owner_name: teamDetail.owner_name,
                  wins: teamDetail.wins,
                  losses: teamDetail.losses,
                  standing: teamDetail.standing,
                  current_salary: teamDetail.current_salary,
                  cap_space: teamDetail.cap_space,
                  logo_url: teamDetail.logo_url,
                });
              }
            } catch {
              // Team might not exist anymore
            }
          }
        }

        setUserTeams(allTeams);

        const storedTeamId = localStorage.getItem(TEAM_ID_STORAGE_KEY);
        if (storedTeamId && allTeams.some((t) => t.id === storedTeamId)) {
          const teamDetail = await fetchTeamDetail(storedTeamId);
          if (teamDetail) {
            setCurrentTeamState(teamDetail);
          }
        } else if (allTeams.length > 0) {
          const firstTeam = allTeams[0];
          localStorage.setItem(TEAM_ID_STORAGE_KEY, firstTeam.id);
          const teamDetail = await fetchTeamDetail(firstTeam.id);
          if (teamDetail) {
            setCurrentTeamState(teamDetail);
          }
        }
      } catch (error) {
        console.error('Failed to load teams and leagues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamsAndLeagues();
  }, [user, authLoading, fetchTeamDetail]);

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        currentLeague,
        userTeams,
        userLeagues,
        setCurrentTeam,
        switchLeague,
        isCommissioner,
        isLoading,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
