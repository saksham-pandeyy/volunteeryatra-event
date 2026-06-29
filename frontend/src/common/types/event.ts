export type EventStatus = "backlog" | "in_progress" | "completed";

export interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  status: EventStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  date: string;
  location?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface EventFilters {
  name?: string;
  date?: string;
  location?: string;
  status?: EventStatus;
  sortAsc?: boolean;
}

export interface ListEventsResponse {
  success: boolean;
  data: Event[];
}

export interface DashboardStats {
  totalEvents: number;
  totalUpcoming: number;
  totalParticipants: number;
  pendingParticipants: number;
  avgPerEvent: number;
  byStatus: { backlog: number; in_progress: number; completed: number };
  monthlyTrend: Array<{ label: string; count: number }>;
}
