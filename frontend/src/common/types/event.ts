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
  category: string;
  max_participants: number | null;
  registration_deadline: string | null;
  start_time: string | null;
  end_time: string | null;
  cover_image_url: string | null;
}

export const EVENT_CATEGORIES = [
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment" },
  { value: "health", label: "Health & Wellness" },
  { value: "community", label: "Community Service" },
  { value: "animal", label: "Animal Welfare" },
  { value: "elderly", label: "Elderly Care" },
  { value: "children", label: "Children & Youth" },
  { value: "disaster", label: "Disaster Relief" },
  { value: "arts", label: "Arts & Culture" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "other", label: "Other" },
] as const;

export interface CreateEventPayload {
  name: string;
  description?: string;
  date: string;
  location?: string;
  category?: string;
  max_participants?: number;
  registration_deadline?: string;
  start_time?: string;
  end_time?: string;
  cover_image_url?: string;
  status?: EventStatus;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface EventFilters {
  name?: string;
  date?: string;
  location?: string;
  status?: EventStatus;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ListEventsResponse {
  success: boolean;
  data: Event[];
  pagination?: PaginationInfo;
}

export interface DashboardStats {
  totalEvents: number;
  totalUpcoming: number;
  totalParticipants: number;
  pendingParticipants: number;
  avgPerEvent: number;
  byStatus: { backlog: number; in_progress: number; completed: number };
  trend: Array<{ label: string; count: number }>;
  trendInterval: "daily" | "monthly" | "yearly";
  eventStatusTrend?: Array<{ label: string; backlog: number; in_progress: number; completed: number }>;
  dateRangeLabel: string;
}
