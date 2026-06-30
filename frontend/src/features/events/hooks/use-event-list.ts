import { useState, useCallback } from "react";
import { useListEventsQuery, useDeleteEventMutation } from "../services";
import type { EventFilters, PaginationInfo } from "@/common/types";
import type { DateRangeValue } from "@/components/ui";
import { format } from "date-fns";

export function useEventList() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams: EventFilters = {
    ...filters,
    sortAsc,
    page,
    limit,
  };

  const { data, isLoading, error } = useListEventsQuery(queryParams);
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();

  const events = data?.data ?? [];
  const pagination: PaginationInfo = data?.pagination ?? { total: 0, page: 1, limit: 10, pages: 0 };

  const handleDelete = async (eventId: string) => { try { await deleteEvent(eventId).unwrap(); } catch {} };

  const handleSearch = useCallback((name: string) => {
    setFilters((prev) => ({ ...prev, name: name || undefined }));
    setPage(1);
  }, []);

  const handleFilterDateRange = useCallback((range: DateRangeValue) => {
    if (range.preset === "all") {
      setFilters((prev) => {
        const { dateFrom, dateTo, ...rest } = prev;
        return rest;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        dateFrom: format(range.from, "yyyy-MM-dd"),
        dateTo: format(range.to, "yyyy-MM-dd"),
      }));
    }
    setPage(1);
  }, []);

  const handleFilterStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status: (status as any) || undefined }));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number, newLimit: number) => {
    if (newLimit !== limit) {
      setLimit(newLimit);
      setPage(1);
    } else {
      setPage(newPage);
    }
  }, [limit]);

  const toggleSort = () => setSortAsc((prev) => !prev);

  return {
    events,
    pagination,
    page,
    limit,
    isLoading,
    error,
    deleteLoading,
    sortAsc,
    filters,
    handleDelete,
    handleSearch,
    handleFilterDateRange,
    handleFilterStatus,
    handlePageChange,
    toggleSort,
  };
}
