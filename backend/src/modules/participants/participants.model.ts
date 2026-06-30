import { supabase } from "../../config/database";
import { DatabaseError } from "../../shared/errors";
import type { ParticipantRow } from "../../shared/types";

export async function findParticipantByEventAndUser(
  eventId: string,
  userId: string | null,
  email: string
): Promise<ParticipantRow | null> {
  let query = supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("email", email);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message);
  return data;
}

export async function reactivateParticipant(
  id: string
): Promise<ParticipantRow> {
  const { data, error } = await supabase
    .from("participants")
    .update({ status: "applied", cancellation_reason: null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function applyToEvent(data: {
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
}): Promise<ParticipantRow> {
  const { data: participant, error } = await supabase
    .from("participants")
    .insert({ ...data, status: "applied" })
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return participant;
}

export async function findParticipantsByEvent(
  eventId: string
): Promise<ParticipantRow[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw new DatabaseError(error.message);
  return data || [];
}

export async function findParticipantById(
  id: string
): Promise<ParticipantRow | null> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message);
  return data;
}

export async function cancelParticipant(
  id: string,
  reason: string
): Promise<ParticipantRow> {
  const { data, error } = await supabase
    .from("participants")
    .update({ status: "cancelled", cancellation_reason: reason })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}
