'use client';

import { Flex } from '@/components/bb/layout';
import { Badge } from '@/components/bb/data-display';
import { getOrdinalSuffix } from '@/utils/format';

export interface TeamHeaderProps {
  name: string;
  ownerName: string;
  logoUrl: string | null;
  wins: number;
  losses: number;
  standing: number;
  isOwnTeam?: boolean;
  isCommissioner?: boolean;
}

export function TeamHeader({
  name,
  ownerName,
  logoUrl,
  wins,
  losses,
  standing,
  isOwnTeam = false,
  isCommissioner = false,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6" data-testid="team-header">
      <div
        className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl bg-surface-hover flex-shrink-0"
        data-testid="team-logo"
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-full w-full object-contain rounded-xl"
          />
        ) : (
          <svg
            className="h-12 w-12 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <Flex align="center" gap="sm" className="flex-wrap mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text" data-testid="team-name">
            {name}
          </h1>
          {isOwnTeam && (
            <Badge variant="primary" size="sm" data-testid="own-team-badge">
              Your Team
            </Badge>
          )}
          {isCommissioner && (
            <Badge variant="info" size="sm" data-testid="commissioner-badge">
              Commissioner
            </Badge>
          )}
        </Flex>
        <p className="text-text-muted mb-2" data-testid="owner-name">
          Owned by {ownerName}
        </p>
        <Flex gap="md" align="center" className="flex-wrap">
          <div className="flex items-center gap-2" data-testid="record">
            <span className="text-lg font-semibold text-text">
              {wins}-{losses}
            </span>
            <span className="text-text-muted">Record</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2" data-testid="standing">
            <span className="text-lg font-semibold text-text">
              {standing}
              <sup className="text-xs">{getOrdinalSuffix(standing)}</sup>
            </span>
            <span className="text-text-muted">Place</span>
          </div>
        </Flex>
      </div>
    </div>
  );
}
