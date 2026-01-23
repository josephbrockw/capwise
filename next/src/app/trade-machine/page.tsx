'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/capwise/layout';
import { Button, Select } from '@/components/bb/ui';
import { Alert, Spinner } from '@/components/bb/feedback';
import {
  TradeTeamColumn,
  TradeAnalysisPanel,
  TradeSummary,
  TradablePlayer,
  TradableDraftPick,
} from '@/components/capwise/trade-machine';
import {
  getTeams,
  getTeam,
  createTrade,
  TeamDetail,
} from '@/api/league';
import { useTeam } from '@/contexts/TeamContext';
import { useLeagueTeams } from '@/stores';

interface TradeState {
  team1: TeamDetail | null;
  team2: TeamDetail | null;
  team1SelectedPlayerIds: Set<string>;
  team1SelectedPickIds: Set<string>;
  team2SelectedPlayerIds: Set<string>;
  team2SelectedPickIds: Set<string>;
}

export default function TradeMachinePage() {
  const { currentTeam, isLoading: teamLoading } = useTeam();
  const teamId = currentTeam?.id;
  const leagueId = currentTeam?.league?.id;

  const { teams, hasData: hasTeamsData, setTeams } = useLeagueTeams(leagueId);

  const [tradeState, setTradeState] = useState<TradeState>({
    team1: null,
    team2: null,
    team1SelectedPlayerIds: new Set(),
    team1SelectedPickIds: new Set(),
    team2SelectedPlayerIds: new Set(),
    team2SelectedPickIds: new Set(),
  });
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingTeam2, setIsLoadingTeam2] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !currentTeam || !leagueId) return;

    // Set team1 from context
    setTradeState((prev) => ({ ...prev, team1: currentTeam }));

    // Fetch teams if not cached
    if (!hasTeamsData) {
      setIsLoadingTeams(true);
      getTeams(teamId)
        .then((teamsData) => {
          setTeams(teamsData);
        })
        .catch((err) => {
          setError('Failed to load teams. Please try again.');
          console.error('Trade machine load error:', err);
        })
        .finally(() => {
          setIsLoadingTeams(false);
        });
    }
  }, [teamId, currentTeam, leagueId, hasTeamsData, setTeams]);

  useEffect(() => {
    if (!selectedTeam2Id || !teamId) return;

    const currentTeamId = teamId; // Capture for closure
    async function loadTeam2() {
      try {
        setIsLoadingTeam2(true);
        const team2Data = await getTeam(selectedTeam2Id, currentTeamId);
        setTradeState((prev) => ({
          ...prev,
          team2: team2Data,
          team2SelectedPlayerIds: new Set(),
          team2SelectedPickIds: new Set(),
        }));
      } catch (err) {
        setError('Failed to load team data. Please try again.');
        console.error(err);
      } finally {
        setIsLoadingTeam2(false);
      }
    }

    loadTeam2();
  }, [selectedTeam2Id, teamId]);

  const currentYear = tradeState.team1?.league?.year ?? new Date().getFullYear();
  const salaryCap = tradeState.team1?.league?.salary_cap ?? 0;

  const team1Players: TradablePlayer[] = useMemo(() => {
    if (!tradeState.team1?.roster) return [];
    return tradeState.team1.roster.map((rp) => ({
      ...rp,
      isSelected: tradeState.team1SelectedPlayerIds.has(rp.id),
    }));
  }, [tradeState.team1?.roster, tradeState.team1SelectedPlayerIds]);

  const team1Picks: TradableDraftPick[] = useMemo(() => {
    if (!tradeState.team1?.draft_picks) return [];
    return tradeState.team1.draft_picks
      .filter((p) => p.year >= currentYear && p.year <= currentYear + 6)
      .map((p) => ({
        ...p,
        isSelected: tradeState.team1SelectedPickIds.has(p.id),
      }));
  }, [tradeState.team1?.draft_picks, tradeState.team1SelectedPickIds, currentYear]);

  const team2Players: TradablePlayer[] = useMemo(() => {
    if (!tradeState.team2?.roster) return [];
    return tradeState.team2.roster.map((rp) => ({
      ...rp,
      isSelected: tradeState.team2SelectedPlayerIds.has(rp.id),
    }));
  }, [tradeState.team2?.roster, tradeState.team2SelectedPlayerIds]);

  const team2Picks: TradableDraftPick[] = useMemo(() => {
    if (!tradeState.team2?.draft_picks) return [];
    return tradeState.team2.draft_picks
      .filter((p) => p.year >= currentYear && p.year <= currentYear + 6)
      .map((p) => ({
        ...p,
        isSelected: tradeState.team2SelectedPickIds.has(p.id),
      }));
  }, [tradeState.team2?.draft_picks, tradeState.team2SelectedPickIds, currentYear]);

  const team1SelectedPlayers = team1Players.filter((p) => p.isSelected);
  const team1SelectedPicks = team1Picks.filter((p) => p.isSelected);
  const team2SelectedPlayers = team2Players.filter((p) => p.isSelected);
  const team2SelectedPicks = team2Picks.filter((p) => p.isSelected);

  const team1SalaryOut = team1SelectedPlayers.reduce((sum, p) => sum + p.salary, 0);
  const team1SalaryIn = team2SelectedPlayers.reduce((sum, p) => sum + p.salary, 0);
  const team2SalaryOut = team2SelectedPlayers.reduce((sum, p) => sum + p.salary, 0);
  const team2SalaryIn = team1SelectedPlayers.reduce((sum, p) => sum + p.salary, 0);

  const team1SalaryAfterTrade = (tradeState.team1?.current_salary ?? 0) - team1SalaryOut + team1SalaryIn;
  const team2SalaryAfterTrade = (tradeState.team2?.current_salary ?? 0) - team2SalaryOut + team2SalaryIn;

  const handleTeam1PlayerSelection = useCallback((playerId: string, selected: boolean) => {
    setTradeState((prev) => {
      const newSet = new Set(prev.team1SelectedPlayerIds);
      if (selected) {
        newSet.add(playerId);
      } else {
        newSet.delete(playerId);
      }
      return { ...prev, team1SelectedPlayerIds: newSet };
    });
  }, []);

  const handleTeam1PickSelection = useCallback((pickId: string, selected: boolean) => {
    setTradeState((prev) => {
      const newSet = new Set(prev.team1SelectedPickIds);
      if (selected) {
        newSet.add(pickId);
      } else {
        newSet.delete(pickId);
      }
      return { ...prev, team1SelectedPickIds: newSet };
    });
  }, []);

  const handleTeam2PlayerSelection = useCallback((playerId: string, selected: boolean) => {
    setTradeState((prev) => {
      const newSet = new Set(prev.team2SelectedPlayerIds);
      if (selected) {
        newSet.add(playerId);
      } else {
        newSet.delete(playerId);
      }
      return { ...prev, team2SelectedPlayerIds: newSet };
    });
  }, []);

  const handleTeam2PickSelection = useCallback((pickId: string, selected: boolean) => {
    setTradeState((prev) => {
      const newSet = new Set(prev.team2SelectedPickIds);
      if (selected) {
        newSet.add(pickId);
      } else {
        newSet.delete(pickId);
      }
      return { ...prev, team2SelectedPickIds: newSet };
    });
  }, []);

  const handleReset = useCallback(() => {
    setTradeState((prev) => ({
      ...prev,
      team1SelectedPlayerIds: new Set(),
      team1SelectedPickIds: new Set(),
      team2SelectedPlayerIds: new Set(),
      team2SelectedPickIds: new Set(),
    }));
    setSuccessMessage(null);
    setError(null);
  }, []);

  const canProposeTrade = useMemo(() => {
    const hasTeam1Assets = team1SelectedPlayers.length > 0 || team1SelectedPicks.length > 0;
    const hasTeam2Assets = team2SelectedPlayers.length > 0 || team2SelectedPicks.length > 0;
    const team1Valid = team1SalaryAfterTrade <= salaryCap;
    const team2Valid = team2SalaryAfterTrade <= salaryCap;
    return hasTeam1Assets && hasTeam2Assets && team1Valid && team2Valid && tradeState.team2 !== null;
  }, [
    team1SelectedPlayers.length, team1SelectedPicks.length,
    team2SelectedPlayers.length, team2SelectedPicks.length,
    team1SalaryAfterTrade, team2SalaryAfterTrade, salaryCap,
    tradeState.team2
  ]);

  const handleProposeTrade = useCallback(async () => {
    if (!teamId || !leagueId || !tradeState.team1 || !tradeState.team2) return;

    try {
      setIsProposing(true);
      setError(null);

      // Build assets array: each player/pick going from one team to the other
      const assets: { from_team: string; to_team: string; player_id?: string; draft_pick_id?: string }[] = [];

      // Team 1 players going to Team 2
      team1SelectedPlayers.forEach((player) => {
        assets.push({
          from_team: tradeState.team1!.id,
          to_team: tradeState.team2!.id,
          player_id: player.player.id,
        });
      });

      // Team 1 picks going to Team 2
      team1SelectedPicks.forEach((pick) => {
        assets.push({
          from_team: tradeState.team1!.id,
          to_team: tradeState.team2!.id,
          draft_pick_id: pick.id,
        });
      });

      // Team 2 players going to Team 1
      team2SelectedPlayers.forEach((player) => {
        assets.push({
          from_team: tradeState.team2!.id,
          to_team: tradeState.team1!.id,
          player_id: player.player.id,
        });
      });

      // Team 2 picks going to Team 1
      team2SelectedPicks.forEach((pick) => {
        assets.push({
          from_team: tradeState.team2!.id,
          to_team: tradeState.team1!.id,
          draft_pick_id: pick.id,
        });
      });

      await createTrade(teamId, {
        league_id: leagueId,
        teams: [tradeState.team1.id, tradeState.team2.id],
        assets,
      });

      setSuccessMessage('Trade proposal sent successfully!');
      handleReset();
    } catch (err) {
      setError('Failed to propose trade. Please try again.');
      console.error(err);
    } finally {
      setIsProposing(false);
    }
  }, [teamId, leagueId, tradeState, team1SelectedPlayers, team1SelectedPicks, team2SelectedPlayers, team2SelectedPicks, handleReset]);

  const otherTeams = teams.filter((t) => t.id !== teamId);
  const teamOptions = otherTeams.map((t) => ({ value: t.id, label: t.name }));

  if (teamLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!teamId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="warning">Please select a team to use the Trade Machine.</Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Trade Machine</h1>
              <p className="text-text-muted text-sm mt-1">
                Build and analyze trades with other teams
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-48">
                <Select
                  id="team2-select"
                  name="team2"
                  value={selectedTeam2Id || ''}
                  onChange={(e) => setSelectedTeam2Id(String(e.target.value))}
                  options={teamOptions}
                  placeholder={isLoadingTeams ? 'Loading...' : 'Trade partner...'}
                  disabled={isProposing || isLoadingTeams}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isProposing}
                data-testid="reset-button"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleProposeTrade}
                disabled={!canProposeTrade || isProposing}
                data-testid="propose-button"
              >
                {isProposing ? 'Proposing...' : 'Propose Trade'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-4" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {tradeState.team1 && (
            <TradeTeamColumn
              teamName={tradeState.team1.name}
              teamAbbreviation={tradeState.team1.abbreviation}
              logoUrl={tradeState.team1.logo_url}
              players={team1Players}
              draftPicks={team1Picks}
              currentSalary={tradeState.team1.current_salary}
              salaryCap={salaryCap}
              salaryAfterTrade={team1SalaryAfterTrade}
              currentYear={currentYear}
              onPlayerSelectionChange={handleTeam1PlayerSelection}
              onPickSelectionChange={handleTeam1PickSelection}
              disabled={isProposing}
              isYourTeam
            />
          )}

          {isLoadingTeam2 ? (
            <div className="rounded-xl border border-border bg-surface flex items-center justify-center min-h-[300px]">
              <Spinner />
            </div>
          ) : tradeState.team2 ? (
            <TradeTeamColumn
              teamName={tradeState.team2.name}
              teamAbbreviation={tradeState.team2.abbreviation}
              logoUrl={tradeState.team2.logo_url}
              players={team2Players}
              draftPicks={team2Picks}
              currentSalary={tradeState.team2.current_salary}
              salaryCap={salaryCap}
              salaryAfterTrade={team2SalaryAfterTrade}
              currentYear={currentYear}
              onPlayerSelectionChange={handleTeam2PlayerSelection}
              onPickSelectionChange={handleTeam2PickSelection}
              disabled={isProposing}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 flex items-center justify-center min-h-[300px]">
              <p className="text-text-muted">
                Select a trade partner to start building a trade
              </p>
            </div>
          )}
        </div>

        {(team1SelectedPlayers.length > 0 || team1SelectedPicks.length > 0 ||
          team2SelectedPlayers.length > 0 || team2SelectedPicks.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tradeState.team1 && (
              <TradeSummary
                teamName={tradeState.team1.name}
                playersOut={team1SelectedPlayers}
                playersIn={team2SelectedPlayers}
                picksOut={team1SelectedPicks}
                picksIn={team2SelectedPicks}
                currentYear={currentYear}
              />
            )}
            {tradeState.team2 && (
              <TradeSummary
                teamName={tradeState.team2.name}
                playersOut={team2SelectedPlayers}
                playersIn={team1SelectedPlayers}
                picksOut={team2SelectedPicks}
                picksIn={team1SelectedPicks}
                currentYear={currentYear}
              />
            )}
          </div>
        )}

        {tradeState.team1 && tradeState.team2 && (
          <TradeAnalysisPanel
            team1Name={tradeState.team1.name}
            team2Name={tradeState.team2.name}
            team1AllPlayers={team1Players}
            team2AllPlayers={team2Players}
            team1PlayersOut={team1SelectedPlayers}
            team1PicksOut={team1SelectedPicks}
            team2PlayersOut={team2SelectedPlayers}
            team2PicksOut={team2SelectedPicks}
            team1CurrentSalary={tradeState.team1.current_salary}
            team2CurrentSalary={tradeState.team2.current_salary}
            salaryCap={salaryCap}
            currentYear={currentYear}
          />
        )}
      </div>
    </AppLayout>
  );
}
