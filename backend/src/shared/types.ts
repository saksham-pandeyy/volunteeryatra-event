export interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export type EventStatus = "backlog" | "in_progress" | "completed";

export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  status: EventStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  category: string;
  max_participants: number | null;
  registration_deadline: string | null;
  start_time: string | null;
  end_time: string | null;
  cover_image_url: string | null;
}

export interface ParticipantRow {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  email: string;
  status: "applied" | "approved" | "cancelled";
  cancellation_reason: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalUpcoming: number;
  totalParticipants: number;
  pendingParticipants: number;
  avgPerEvent: number;
  byStatus: { backlog: number; in_progress: number; completed: number };
  monthlyTrend: Array<{ label: string; count: number }>;
  dateRangeLabel: string;
}
