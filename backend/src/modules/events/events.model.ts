import { supabase } from "../../config/database";
import { DatabaseError } from "../../shared/errors";
import type { EventRow, EventStatus as SharedEventStatus, DashboardStats } from "../../shared/types";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export type EventStatus = SharedEventStatus;

export interface EventFilters {
  name?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  status?: EventStatus;
  sortAsc?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function findAllEvents(
  filters: EventFilters
): Promise<PaginatedResult<EventRow>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const offset = (page - 1) * limit;

  let countQuery = supabase.from("events").select("*", { count: "exact", head: true });
  let query = supabase.from("events").select("*");

  if (filters.name) {
    const pattern = "%" + filters.name + "%";
    countQuery = countQuery.ilike("name", pattern);
    query = query.ilike("name", pattern);
  }
  if (filters.date) {
    countQuery = countQuery.eq("date", filters.date);
    query = query.eq("date", filters.date);
  }
  if (filters.dateFrom) {
    countQuery = countQuery.gte("date", filters.dateFrom);
    query = query.gte("date", filters.dateFrom);
  }
  if (filters.dateTo) {
    countQuery = countQuery.lte("date", filters.dateTo);
    query = query.lte("date", filters.dateTo);
  }
  if (filters.location) {
    const pattern = "%" + filters.location + "%";
    countQuery = countQuery.ilike("location", pattern);
    query = query.ilike("location", pattern);
  }
  if (filters.status) {
    countQuery = countQuery.eq("status", filters.status);
    query = query.eq("status", filters.status);
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw new DatabaseError(countError.message);

  const total = count ?? 0;
  const pages = Math.ceil(total / limit);

  const { data, error } = await query
    .order("date", { ascending: filters.sortAsc ?? true })
    .range(offset, offset + limit - 1);

  if (error) throw new DatabaseError(error.message);
  return { data, total, page, limit, pages };
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

  // Determine trend grouping based on date range and actual data span
  let trendInterval: "daily" | "monthly" | "yearly" = "monthly";

  const uniqueYears = new Set(events.map((e) => new Date(e.date).getFullYear()));

  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365 && uniqueYears.size > 1) {
      // Only use yearly if the actual data spans multiple years
      trendInterval = "yearly";
    } else if (diffDays <= 31) {
      trendInterval = "daily";
    }
  } else {
    // All time or open range — check how many unique years exist in the data
    if (uniqueYears.size > 1) {
      trendInterval = "yearly";
    }
    // If only 1 unique year, keep default "monthly"
  }

  // Compute trend data based on interval
  const trendMap = new Map<string, number>();
  events.forEach((e) => {
    const d = new Date(e.date);
    let key: string;
    if (trendInterval === "yearly") {
      key = d.getFullYear().toString();
    } else if (trendInterval === "daily") {
      key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      key = MONTH_LABELS[d.getMonth()];
    }
    trendMap.set(key, (trendMap.get(key) || 0) + 1);
  });

  // Sort trend data chronologically
  const sortKey: Record<string, number> = {};
  if (trendInterval === "yearly") {
    events.forEach((e) => { const y = new Date(e.date).getFullYear().toString(); if (!(y in sortKey)) sortKey[y] = parseInt(y); });
  } else if (trendInterval === "daily") {
    events.forEach((e) => { const d = new Date(e.date); const k = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); if (!(k in sortKey)) sortKey[k] = d.getTime(); });
  } else {
    MONTH_LABELS.forEach((m, i) => { sortKey[m] = i; });
  }

  const trend = Array.from(trendMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => (sortKey[a.label] || 0) - (sortKey[b.label] || 0));

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
    trend,
    trendInterval,
    dateRangeLabel,
  };
}
