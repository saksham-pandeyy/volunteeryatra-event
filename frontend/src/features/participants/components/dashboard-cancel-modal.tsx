"use client";

import { Modal } from "@/components/ui";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import type { Participant } from "@/common/types";

interface CancelModalProps {
  cancelTarget: Participant | null;
  cancelReason: string;
  cancelLoading: boolean;
  onClose: () => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export function CancelRegistrationModal({
  cancelTarget,
  cancelReason,
  cancelLoading,
  onClose,
  onReasonChange,
  onConfirm,
}: CancelModalProps) {
  return (
    <Modal
      open={!!cancelTarget}
      onClose={onClose}
      title="Cancel Registration"
    >
      <div className="space-y-4">
        <p className="text-muted">
          Cancel registration for <strong>{cancelTarget?.name}</strong>?
        </p>
        <Input
          label="Reason for cancellation"
          value={cancelReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter reason..."
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Keep
          </Button>
          <Button
            variant="danger"
            loading={cancelLoading}
            disabled={!cancelReason.trim()}
            onClick={onConfirm}
          >
            Cancel Registration
          </Button>
        </div>
      </div>
    </Modal>
  );
}
