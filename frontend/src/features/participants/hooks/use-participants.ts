import { useListParticipantsQuery, useCancelParticipantMutation } from "../services";
import type { Participant } from "@/common/types";

export function useParticipants(eventId: string) {
  const { data, isLoading, error } = useListParticipantsQuery(eventId, { skip: !eventId });
  const [cancelParticipant, { isLoading: cancelLoading }] = useCancelParticipantMutation();
  const participants: Participant[] = data ?? [];

  const handleCancel = async (participantId: string, reason: string) => {
    await cancelParticipant({ eventId, participantId, data: { reason } }).unwrap();
  };

  return { participants, isLoading, error, cancelLoading, handleCancel };
}
