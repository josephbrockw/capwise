'use client';

import { useState } from 'react';
import { DraftPick, RookieListItem } from '@/api/league';
import { Modal } from '@/components/bb/feedback';
import { Button } from '@/components/bb/ui';
import { RookieList } from './RookieList';

export interface MakePickModalProps {
  isOpen: boolean;
  onClose: () => void;
  pick: DraftPick | null;
  rookies: RookieListItem[];
  isLoading?: boolean;
  onConfirm: (pickId: string, rookieId: string) => void;
}

export function MakePickModal({
  isOpen,
  onClose,
  pick,
  rookies,
  isLoading = false,
  onConfirm,
}: MakePickModalProps) {
  const [selectedRookie, setSelectedRookie] = useState<RookieListItem | null>(null);

  const handleConfirm = () => {
    if (pick && selectedRookie) {
      onConfirm(pick.id, selectedRookie.id);
    }
  };

  const handleClose = () => {
    setSelectedRookie(null);
    onClose();
  };

  if (!pick) return null;

  const pickNumber = pick.pick_number ?? pick.projected_number ?? '-';

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      title={`Make Pick #${pickNumber}`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedRookie || isLoading}
          >
            {isLoading ? 'Confirming...' : 'Confirm Pick'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-surface-alt rounded-lg">
          <p className="text-sm text-text-muted">
            Selecting for <span className="font-medium text-text">{pick.current_team_name}</span>
          </p>
          {pick.original_team_name !== pick.current_team_name && (
            <p className="text-xs text-text-muted mt-1">
              (Originally {pick.original_team_name}&apos;s pick)
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-text mb-2">Select a Rookie</h4>
          <RookieList
            rookies={rookies}
            onSelectRookie={setSelectedRookie}
            selectedRookieId={selectedRookie?.id}
          />
        </div>

        {selectedRookie && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-text">
              Selected: <span className="font-semibold">{selectedRookie.name}</span>
              <span className="text-text-muted"> ({selectedRookie.positions.join('/')})</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
