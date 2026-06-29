export type ParticipantStatus = "applied" | "approved" | "cancelled";

export interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  cancellation_reason: string | null;
  created_at: string;
}

export interface ApplyToEventPayload {
  name: string;
  email: string;
}

export interface CancelRegistrationPayload {
  reason: string;
}

export interface ListParticipantsResponse {
  success: boolean;
  data: Participant[];
}
