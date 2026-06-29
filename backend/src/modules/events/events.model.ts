import { supabase } from "../../config/database";
import { DatabaseError } from "../../shared/errors";
import type { EventRow, EventStatus as SharedEventStatus, DashboardStats } from "../../shared/types";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export type EventStatus = SharedEventStatus;

export interface EventFilters {
  name?: string;
  date?: string;
  location?: string;
  status?: EventStatus;
  sortAsc?: boolean;
}

export async function findAllEvents(
  filters: EventFilters
): Promise<EventRow[]> {
  let query = supabase.from("events").select("*");

  if (filters.name) query = query.ilike("name", `%${filters.name}%`);
  if (filters.date) query = query.eq("date", filters.date);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("date", {
    ascending: filters.sortAsc ?? true,
  });

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function findEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message);
  return data;
}

export async function createEvent(data: {
  name: string;
  description?: string;
  date: string;
  location?: string;
  status?: EventStatus;
  owner_id: string;
  category?: string;
  max_participants?: number;
  registration_deadline?: string;
  start_time?: string;
  end_time?: string;
  cover_image_url?: string;
}): Promise<EventRow> {
  const { data: event, error } = await supabase
    .from("events")
    .insert({ ...data, status: data.status || "backlog", category: data.category || "other" })
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return event;
}

export async function updateEvent(
  id: string,
  data: Partial<Pick<EventRow, "name" | "description" | "date" | "location" | "status" | "category" | "max_participants" | "registration_deadline" | "start_time" | "end_time" | "cover_image_url">>
): Promise<EventRow> {
  const { data: event, error } = await supabase
    .from("events")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return event;
}

export async function updateEventStatus(
  id: string,
  status: EventStatus
): Promise<EventRow> {
  const { data, error } = await supabase
    .from("events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new DatabaseError(error.message);
}

export async function getDashboardStats(fromDate?: string, toDate?: string): Promise<DashboardStats> {
  let query = supabase.from("events").select("*");
  if (fromDate) query = query.gte("date", fromDate);
  if (toDate) query = query.lte("date", toDate);

  const { data: events, error } = await query;
  if (error) throw new DatabaseError(error.message);

  const now = new Date();
  const totalUpcoming = events.filter((e) => new Date(e.date) > now).length;

  // Fetch all participants (not filtered by date since they span events)
  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("id, status");
  if (pErr) throw new DatabaseError(pErr.message);

  const totalParticipants = participants?.length || 0;
  const pendingParticipants = participants?.filter((p) => p.status === "applied").length || 0;

  const byStatus = {
    backlog: events.filter((e) => e.status === "backlog").length,
    in_progress: events.filter((e) => e.status === "in_progress").length,
    completed: events.filter((e) => e.status === "completed").length,
  };

  // Monthly trend for the filtered events
  const monthlyCounts = new Array(12).fill(0);
  events.forEach((e) => {
    const m = new Date(e.date).getMonth();
    monthlyCounts[m]++;
  });
  const currentMonth = now.getMonth();
  const monthlyTrend = MONTH_LABELS
    .map((label, i) => ({ label, count: monthlyCounts[i] }))
    .slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  // Date range label
  let dateRangeLabel = "All time";
  if (fromDate && toDate) {
    const from = new Date(fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const to = new Date(toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    dateRangeLabel = `${from} – ${to}`;
  } else if (fromDate) {
    dateRangeLabel = `From ${new Date(fromDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  } else if (toDate) {
    dateRangeLabel = `Until ${new Date(toDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }

  return {
    totalEvents: events.length,
    totalUpcoming,
    totalParticipants,
    pendingParticipants,
    avgPerEvent: events.length > 0 ? Math.round(totalParticipants / events.length) : 0,
    byStatus,
    monthlyTrend,
    dateRangeLabel,
  };
}
