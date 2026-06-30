"use client";

import { useState, useCallback } from "react";
import { useApplyToEventMutation } from "@/features/participants/services";
import { useAuth } from "@/features/auth/hooks";
import { notify } from "@/common/utils";

export function useApplyToEvent(eventId: string, onSuccess?: () => void) {
  const { user } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyToEvent, { isLoading }] = useApplyToEventMutation();

  const handleApply = useCallback(async () => {
    if (!user || !eventId) return;
    try {
      await applyToEvent({
        eventId,
        data: {
          name: user.name,
          email: user.email,
        },
      }).unwrap();

      setHasApplied(true);
      notify.success("You've registered successfully! Check your dashboard for details.");
      setShowConfirmModal(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
        "Failed to register. Please try again.";
      notify.error(message);
    }
  }, [user, eventId, applyToEvent, onSuccess]);

  return {
    user,
    showConfirmModal,
    setShowConfirmModal,
    handleApply,
    isApplying: isLoading,
    hasApplied,
    setHasApplied,
  };
}
