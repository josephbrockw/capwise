'use client';

import { useState } from 'react';
import { Modal } from '@/components/bb/feedback';
import { Button, Input } from '@/components/bb/ui';
import { Stack, Flex, Divider } from '@/components/bb/layout';
import { Badge } from '@/components/bb/data-display';
import { Player } from '@/api/league';

export interface PlayerQuickViewProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToRoster?: (player: Player, salary: number) => void;
  canAddToRoster?: boolean;
  minSalary?: number;
  maxSalary?: number;
}

interface StatRowProps {
  label: string;
  value: string | number;
  suffix?: string;
}

function StatRow({ label, value, suffix = '' }: StatRowProps) {
  return (
    <Flex justify="between" className="py-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text">
        {value}
        {suffix}
      </span>
    </Flex>
  );
}

export function PlayerQuickView({
  player,
  isOpen,
  onClose,
  onAddToRoster,
  canAddToRoster = false,
  minSalary = 1,
  maxSalary = 100,
}: PlayerQuickViewProps) {
  const [salary, setSalary] = useState<number>(player?.projected_value || minSalary);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  if (!player) return null;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSalary(value);
    if (value < minSalary) {
      setSalaryError(`Minimum salary is $${minSalary}`);
    } else if (value > maxSalary) {
      setSalaryError(`Maximum salary is $${maxSalary}`);
    } else {
      setSalaryError(null);
    }
  };

  const handleAddToRoster = () => {
    if (onAddToRoster && !salaryError && salary >= minSalary && salary <= maxSalary) {
      onAddToRoster(player, salary);
      onClose();
    }
  };

  const stats = player.stats;

  return (
    <Modal open={isOpen} onClose={onClose} title={player.name} size="md">
      <Stack gap="md">
        <Flex gap="sm" align="center" wrap>
          {player.positions?.map((pos) => (
            <Badge key={pos} variant="info" size="sm">
              {pos}
            </Badge>
          ))}
          {player.nba_team && (
            <Badge variant="default" size="sm">
              {player.nba_team}
            </Badge>
          )}
          {player.is_injured && (
            <Badge variant="danger" size="sm">
              {player.injury_status || 'Injured'}
            </Badge>
          )}
        </Flex>

        <div className="bg-surface-hover rounded-lg p-4">
          <div className="text-sm font-medium text-text-muted mb-2">Projected Value</div>
          <div className="text-2xl font-bold text-primary-500">
            ${player.projected_value?.toLocaleString() || 0}
          </div>
        </div>

        {stats && (
          <>
            <Divider />
            <div>
              <h4 className="text-sm font-semibold text-text mb-2">Season Averages</h4>
              <div className="grid grid-cols-2 gap-x-4">
                <StatRow label="Games Played" value={stats.games_played || 0} />
                <StatRow label="Minutes" value={(stats.minutes_per_game || 0).toFixed(1)} />
                <StatRow label="Points" value={(stats.points_per_game || 0).toFixed(1)} />
                <StatRow label="Rebounds" value={(stats.rebounds_per_game || 0).toFixed(1)} />
                <StatRow label="Assists" value={(stats.assists_per_game || 0).toFixed(1)} />
                <StatRow label="Steals" value={(stats.steals_per_game || 0).toFixed(1)} />
                <StatRow label="Blocks" value={(stats.blocks_per_game || 0).toFixed(1)} />
                <StatRow label="Turnovers" value={(stats.turnovers_per_game || 0).toFixed(1)} />
              </div>
            </div>

            <Divider />
            <div>
              <h4 className="text-sm font-semibold text-text mb-2">Shooting</h4>
              <div className="grid grid-cols-3 gap-x-4">
                <StatRow label="FG%" value={(stats.field_goal_pct || 0).toFixed(1)} suffix="%" />
                <StatRow label="3P%" value={(stats.three_point_pct || 0).toFixed(1)} suffix="%" />
                <StatRow label="FT%" value={(stats.free_throw_pct || 0).toFixed(1)} suffix="%" />
              </div>
            </div>

            <Divider />
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <Flex justify="between" align="center">
                <span className="font-medium text-text">Fantasy Points Avg</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {(stats.fantasy_points_avg || 0).toFixed(1)}
                </span>
              </Flex>
            </div>
          </>
        )}

        {onAddToRoster && (
          <>
            <Divider />
            <div>
              <h4 className="text-sm font-semibold text-text mb-3">Add to Roster</h4>
              <Flex gap="md" align="start">
                <div className="flex-1">
                  <Input
                    id="salary-input"
                    name="salary"
                    type="number"
                    label="Salary"
                    value={salary}
                    onChange={handleSalaryChange}
                    error={salaryError || undefined}
                    min={minSalary}
                    max={maxSalary}
                  />
                </div>
                <div className="pt-7">
                  <Button
                    variant="primary"
                    onClick={handleAddToRoster}
                    disabled={!canAddToRoster || !!salaryError || player.is_injured}
                  >
                    Add to Roster
                  </Button>
                </div>
              </Flex>
              {player.is_injured && (
                <p className="text-sm text-warning-600 mt-2">
                  This player is currently injured and cannot be added to roster.
                </p>
              )}
              {!canAddToRoster && !player.is_injured && (
                <p className="text-sm text-text-muted mt-2">
                  You don&apos;t have enough cap space or roster spots to add this player.
                </p>
              )}
            </div>
          </>
        )}

        <Flex justify="end" gap="sm" className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
}
