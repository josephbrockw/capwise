'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/capwise/layout';
import { Tabs } from '@/components/bb/navigation';
import { Alert, Spinner, Modal } from '@/components/bb/feedback';
import { Button } from '@/components/bb/ui';
import {
  DraftBoard,
  DraftOrderDisplay,
  RookieList,
  LotteryOddsDisplay,
  LotteryResultsDisplay,
  MakePickModal,
} from '@/components/capwise/rookie-draft';
import {
  getDraftPicks,
  getRookies,
  getLotteryOdds,
  getLotteryResults,
  runLottery,
  makePick,
  DraftPick,
  RookieListItem,
  LotteryOdds,
  LotteryResult,
} from '@/api/league';
import { useTeam } from '@/contexts/TeamContext';

type TabId = 'draft-board' | 'rookies' | 'lottery';

export default function RookieDraftPage() {
  const { currentTeam, isLoading: teamLoading } = useTeam();
  const teamId = currentTeam?.id;
  const leagueYear = currentTeam?.league?.year;
  const isCommissioner = currentTeam?.league?.commissioner_id === currentTeam?.owner_id;

  const [activeTab, setActiveTab] = useState<TabId>('draft-board');
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [rookies, setRookies] = useState<RookieListItem[]>([]);
  const [lotteryOdds, setLotteryOdds] = useState<LotteryOdds[]>([]);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);

  const [isLoadingPicks, setIsLoadingPicks] = useState(false);
  const [isLoadingRookies, setIsLoadingRookies] = useState(false);
  const [isLoadingLottery, setIsLoadingLottery] = useState(false);
  const [isRunningLottery, setIsRunningLottery] = useState(false);
  const [isMakingPick, setIsMakingPick] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedPick, setSelectedPick] = useState<DraftPick | null>(null);
  const [isMakePickModalOpen, setIsMakePickModalOpen] = useState(false);
  const [isLotteryConfirmOpen, setIsLotteryConfirmOpen] = useState(false);

  const lotteryRun = lotteryResult !== null;

  const currentPickNumber = useMemo(() => {
    if (!lotteryRun) return null;

    const unusedPicks = draftPicks
      .filter((p) => p.assigned_name === null && p.pick_number !== null)
      .sort((a, b) => {
        const roundDiff = a.round - b.round;
        if (roundDiff !== 0) return roundDiff;
        return (a.pick_number ?? 999) - (b.pick_number ?? 999);
      });

    return unusedPicks.length > 0 ? unusedPicks[0].pick_number : null;
  }, [draftPicks, lotteryRun]);

  const fetchDraftPicks = useCallback(async () => {
    if (!teamId || !leagueYear) return;

    setIsLoadingPicks(true);
    try {
      const picks = await getDraftPicks(teamId, { year: leagueYear });
      setDraftPicks(picks);
    } catch (err) {
      console.error('Failed to fetch draft picks:', err);
      setError('Failed to load draft picks');
    } finally {
      setIsLoadingPicks(false);
    }
  }, [teamId, leagueYear]);

  const fetchRookies = useCallback(async () => {
    if (!teamId) return;

    setIsLoadingRookies(true);
    try {
      const rookieList = await getRookies(teamId, {});
      setRookies(rookieList);
    } catch (err) {
      console.error('Failed to fetch rookies:', err);
      setError('Failed to load rookies');
    } finally {
      setIsLoadingRookies(false);
    }
  }, [teamId]);

  const fetchLotteryData = useCallback(async () => {
    if (!teamId) return;

    setIsLoadingLottery(true);
    try {
      const [odds, result] = await Promise.all([
        getLotteryOdds(teamId).catch(() => []),
        getLotteryResults(teamId).catch(() => null),
      ]);
      setLotteryOdds(odds);
      setLotteryResult(result);
    } catch (err) {
      console.error('Failed to fetch lottery data:', err);
    } finally {
      setIsLoadingLottery(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchRookies();
      fetchLotteryData();
    }
    if (teamId && leagueYear) {
      fetchDraftPicks();
    }
  }, [teamId, leagueYear, fetchDraftPicks, fetchRookies, fetchLotteryData]);

  const handleRunLottery = async () => {
    if (!teamId) return;

    setIsRunningLottery(true);
    setError(null);
    try {
      const result = await runLottery(teamId);
      setLotteryResult(result);
      setSuccessMessage('Lottery completed successfully!');
      setIsLotteryConfirmOpen(false);
      await fetchDraftPicks();
    } catch (err) {
      console.error('Failed to run lottery:', err);
      setError(err instanceof Error ? err.message : 'Failed to run lottery');
    } finally {
      setIsRunningLottery(false);
    }
  };

  const handleMakePick = (pick: DraftPick) => {
    setSelectedPick(pick);
    setIsMakePickModalOpen(true);
  };

  const handleConfirmPick = async (pickId: string, rookieId: string) => {
    if (!teamId) return;

    setIsMakingPick(true);
    setError(null);
    try {
      await makePick(teamId, pickId, rookieId);
      setSuccessMessage('Pick made successfully!');
      setIsMakePickModalOpen(false);
      setSelectedPick(null);
      await Promise.all([fetchDraftPicks(), fetchRookies()]);
    } catch (err) {
      console.error('Failed to make pick:', err);
      setError(err instanceof Error ? err.message : 'Failed to make pick');
    } finally {
      setIsMakingPick(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const tabs = useMemo(() => {
    return [
      { id: 'draft-board' as TabId, label: 'Draft Board' },
      { id: 'rookies' as TabId, label: 'Available Rookies' },
      { id: 'lottery' as TabId, label: 'Draft Order' },
    ];
  }, []);

  if (teamLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!currentTeam) {
    return (
      <AppLayout>
        <Alert variant="warning">
          Please select a team to view the rookie draft.
        </Alert>
      </AppLayout>
    );
  }

  const isLoading = isLoadingPicks || isLoadingRookies || isLoadingLottery;

  return (
    <AppLayout>
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <div className="flex items-center justify-between pb-2 mt-1">
          <div>
            <h1 className="text-3xl font-bold text-text">
              {leagueYear} Rookie Draft
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {currentTeam.league?.name}
            </p>
          </div>
          {lotteryRun && currentPickNumber && (
            <div className="text-right">
              <p className="text-xs text-text-muted uppercase tracking-wider">Current Pick</p>
              <p className="text-2xl font-bold text-primary">#{currentPickNumber}</p>
            </div>
          )}
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
          variant="pills"
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'draft-board' && (
              <div className="bg-surface rounded-xl shadow-lg p-6">
                <DraftBoard
                  picks={draftPicks}
                  currentPickNumber={currentPickNumber}
                  isCommissioner={isCommissioner}
                  onMakePick={lotteryRun ? handleMakePick : undefined}
                />
              </div>
            )}

            {activeTab === 'rookies' && (
              <div className="bg-surface rounded-xl shadow-lg p-6">
                <RookieList rookies={rookies} />
              </div>
            )}

            {activeTab === 'lottery' && (
              <div className="bg-surface rounded-xl shadow-lg p-6">
                {lotteryResult ? (
                  <LotteryResultsDisplay result={lotteryResult} />
                ) : (
                  <DraftOrderDisplay
                    picks={draftPicks}
                    currentTeamId={teamId}
                  />
                )}
              </div>
            )}
          </>
        )}

        <MakePickModal
          isOpen={isMakePickModalOpen}
          onClose={() => {
            setIsMakePickModalOpen(false);
            setSelectedPick(null);
          }}
          pick={selectedPick}
          rookies={rookies}
          isLoading={isMakingPick}
          onConfirm={handleConfirmPick}
        />

        <Modal
          open={isLotteryConfirmOpen}
          onClose={() => setIsLotteryConfirmOpen(false)}
          title="Confirm Run Lottery"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsLotteryConfirmOpen(false)}
                disabled={isRunningLottery}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRunLottery}
                disabled={isRunningLottery}
              >
                {isRunningLottery ? 'Running...' : 'Run Lottery'}
              </Button>
            </>
          }
        >
          <p className="text-text">
            Are you sure you want to run the lottery? This action cannot be undone.
          </p>
          <p className="text-sm text-text-muted mt-2">
            The lottery will determine picks 1 and 2 based on team odds.
          </p>
        </Modal>
      </div>
    </AppLayout>
  );
}
