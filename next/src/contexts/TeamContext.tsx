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
      const leagueExists = userLeagues.some((l) => l.id === leagueId);
      if (leagueExists && userTeams.length > 0) {
        setCurrentTeam(userTeams[0].id);
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
        const storedTeamId = localStorage.getItem(TEAM_ID_STORAGE_KEY);

        // If we have a stored team ID, fetch that team directly
        if (storedTeamId) {
          try {
            const teamDetail = await getTeam(storedTeamId, storedTeamId);
            if (teamDetail) {
              setCurrentTeamState(teamDetail);
              setUserTeams([
                {
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
                },
              ]);
              if (teamDetail.league) {
                setUserLeagues([teamDetail.league]);
              }
              return;
            }
          } catch {
            // Team might not exist anymore, clear the stored ID
            localStorage.removeItem(TEAM_ID_STORAGE_KEY);
          }
        }

        // Fallback: fetch leagues if no stored team or fetch failed
        const leagues = await getLeagues();
        setUserLeagues(leagues);
        setUserTeams([]);
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
