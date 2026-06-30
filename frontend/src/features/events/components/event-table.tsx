"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataTable, createColumnHelper, Button, Select, DatePicker, StatusDropdown } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import type { Event, EventFilters } from "@/common/types";
import { formatDate } from "@/common/utils";
import { Trash2, Users, Pencil, Eye } from "lucide-react";

interface EventTableProps {
  events: Event[];
  filters: EventFilters;
  handleSearch: (name: string) => void;
  handleFilterStatus: (status: string) => void;
  handleFilterDate: (date: string) => void;
  onDeleteClick: (event: Event) => void;
  pagination?: { total: number; page: number; limit: number; pages: number };
  page?: number;
  onPageChange?: (page: number, limit: number) => void;
}

const columnHelper = createColumnHelper<Event>();

export function EventTable({
  events,
  filters,
  handleSearch,
  handleFilterStatus,
  handleFilterDate,
  onDeleteClick,
  pagination,
  page = 1,
  onPageChange,
}: EventTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Event, unknown>[] = [
    columnHelper.accessor("name", {
      header: "Event",
      size: 220,
      cell: (info: any) => (
        <span className="font-medium text-[var(--color-base-800)] truncate block">{info.getValue()}</span>
      ),
    }) as ColumnDef<Event, unknown>,
    columnHelper.accessor("date", {
      header: "Date",
      size: 140,
      cell: (info: any) => (
        <span className="text-sm text-[var(--color-base-600)]">{formatDate(info.getValue())}</span>
      ),
    }) as ColumnDef<Event, unknown>,
    columnHelper.accessor("location", {
      header: "Location",
      size: 150,
      cell: (info: any) => (
        <span className="text-sm text-[var(--color-base-500)] truncate block">{info.getValue() || "—"}</span>
      ),
    }) as ColumnDef<Event, unknown>,
    columnHelper.accessor("category", {
      header: "Category",
      size: 130,
      cell: (info: any) => {
        const cat = info.getValue() as string;
        return <span className="text-sm text-[var(--color-base-600)] capitalize">{cat || "other"}</span>;
      },
    }) as ColumnDef<Event, unknown>,
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      cell: (info: any) => <StatusDropdown value={info.getValue()} eventId={info.row.original.id} />,
    }) as ColumnDef<Event, unknown>,
    columnHelper.accessor("participant_count", {
      header: "Capacity",
      size: 120,
      cell: (info: any) => (
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-[var(--color-base-400)]" />
          <span className="font-semibold text-[var(--color-base-700)]">{info.getValue() ?? 0}</span>
          {info.row.original.max_participants && (
            <span className="text-xs text-[var(--color-base-400)]">/ {info.row.original.max_participants}</span>
          )}
        </div>
      ),
    }) as ColumnDef<Event, unknown>,
    columnHelper.display({
      id: "actions",
      header: "",
      size: 120,
      cell: (info: any) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            className="dt-action-btn dt-action-view"
            onClick={() => router.push(`/events/${info.row.original.id}`)}
            title="View event details"
          >
            <Eye size={16} strokeWidth={2} />
          </button>
          <button
            className="dt-action-btn dt-action-edit"
            onClick={() => router.push(`/events/${info.row.original.id}/edit`)}
            title="Edit event"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            className="dt-action-btn dt-action-delete"
            onClick={() => onDeleteClick(info.row.original)}
            title="Delete event"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      ),
    }) as ColumnDef<Event, unknown>,
  ];

  return (
    <DataTable
      columns={columns}
      data={events}
      showToolbar={true}
      search={filters.name || ""}
      onSearchChange={handleSearch}
      filterPlaceholder="Search events by name..."
      filters={
        <div className="flex items-center gap-3">
          <div className="w-[160px]">
            <Select
              value={filters.status || ""}
              onChange={handleFilterStatus}
              options={[
                { value: "", label: "All Statuses" },
                { value: "backlog", label: "Backlog" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" }
              ]}
              placeholder="Filter Status"
            />
          </div>
          <div className="w-[180px]">
            <DatePicker
              value={filters.date || ""}
              onChange={handleFilterDate}
              placeholder="Select Date"
            />
          </div>
        </div>
      }
      pagination={pagination}
      page={page}
      onPageChange={onPageChange}
    />
  );
}
