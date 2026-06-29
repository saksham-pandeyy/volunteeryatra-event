"use client";

import { useRouter } from "next/navigation";
import { useEventList } from "../hooks";
import { useDeleteEventMutation } from "../services";
import { DataTable, createColumnHelper, Button, Badge, EmptyState, AuthenticatedLayout, SkeletonTable } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { formatDate, isUpcoming, daysUntil } from "@/common/utils";
import type { Event } from "@/common/types";

const columnHelper = createColumnHelper<Event>();

export function EventListPage() {
  const router = useRouter();
  const { events, isLoading, handleSearch, handleFilterDate, toggleSort, sortAsc } = useEventList();
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();

  const handleDelete = async (eventId: string) => {
    try { await deleteEvent(eventId).unwrap(); } catch { /* handled by cache */ }
  };

  const columns: ColumnDef<Event, unknown>[] = [
    columnHelper.accessor("name", { header: "Event", enableColumnFilter: true, size: 220, cell: (info: any) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-xs text-muted mt-0.5 truncate max-w-[200px]">{info.row.original.description || "No description"}</p>
      </div>
    )}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("date", { header: "Date", size: 160, cell: (info: any) => (
      <div>
        <p className="text-sm">{formatDate(info.getValue())}</p>
        <p className="text-xs text-muted mt-0.5">{daysUntil(info.getValue())}</p>
      </div>
    )}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("location", { header: "Location", size: 160, cell: (info: any) => <span className="text-sm">{info.getValue() || "—"}</span>}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("participant_count", { header: "Participants", size: 100, cell: (info: any) => <span className="text-sm font-medium">{info.getValue() ?? 0}</span>}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("date", { id: "status", header: "Status", size: 100, cell: (info: any) => {
      const upcoming = isUpcoming(info.getValue());
      return <Badge variant={upcoming ? "success" : "default"}>{upcoming ? "Upcoming" : "Past"}</Badge>;
    }}) as ColumnDef<Event, unknown>,
    columnHelper.display({ id: "actions", header: "", size: 120, cell: (info: any) => (
      <div className="flex gap-1.5">
        <Button size="sm" variant="ghost" onClick={() => router.push(`/events/${info.row.original.id}`)}>View</Button>
        <Button size="sm" variant="danger" loading={deleteLoading} onClick={() => handleDelete(info.row.original.id)}>Delete</Button>
      </div>
    )}) as ColumnDef<Event, unknown>,
  ];

  const upcoming = events.filter((e) => isUpcoming(e.date)).length;
  const total = events.length;

  return (
    <AuthenticatedLayout>
      <div className="page-container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-heading">Events</h1>
            <p className="text-muted text-sm mt-1">{total} total &middot; {upcoming} upcoming</p>
          </div>
          <Button onClick={() => router.push("/events/create")}>Create Event</Button>
        </div>

        {(total > 0 || isLoading) && (
          <div className="flex items-center gap-3">
            <input placeholder="Search by name..." onChange={(e) => handleSearch(e.target.value)} className="form-input max-w-xs" />
            <input type="date" onChange={(e) => handleFilterDate(e.target.value)} className="form-input max-w-[150px]" />
            <Button variant="secondary" size="sm" onClick={toggleSort}>Sort: {sortAsc ? "Oldest" : "Newest"}</Button>
          </div>
        )}

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : events.length === 0 ? (
          <EmptyState message="No events found" description="Create your first event to get started" />
        ) : (
          <DataTable columns={columns} data={events} filterColumn="name" filterPlaceholder="Search events..." />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
