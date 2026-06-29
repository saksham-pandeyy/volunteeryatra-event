import { useState } from "react";
import { useListEventsQuery, useDeleteEventMutation } from "../services";
import type { EventFilters } from "@/common/types";

export function useEventList() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [sortAsc, setSortAsc] = useState(true);
  const { data, isLoading, error } = useListEventsQuery({ ...filters, sortAsc });
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();
  const events = data ?? [];

  const handleDelete = async (eventId: string) => { try { await deleteEvent(eventId).unwrap(); } catch {} };
  const handleSearch = (name: string) => setFilters((prev) => ({ ...prev, name: name || undefined }));
  const handleFilterDate = (date: string) => setFilters((prev) => ({ ...prev, date: date || undefined }));
  const toggleSort = () => setSortAsc((prev) => !prev);

  return { events, isLoading, error, deleteLoading, sortAsc, filters, handleDelete, handleSearch, handleFilterDate, toggleSort };
}
