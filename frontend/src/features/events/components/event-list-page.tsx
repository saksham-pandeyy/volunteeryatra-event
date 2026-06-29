"use client";

import { useRouter } from "next/navigation";
import { useEventList, useDeleteEvent } from "../hooks";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { DataTable, createColumnHelper, Button, Badge, SkeletonTable, SearchBar } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";

import { formatDate, isUpcoming, daysUntil } from "@/common/utils";
import type { Event } from "@/common/types";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";

const columnHelper = createColumnHelper<Event>();

export function EventListPage() {
  const router = useRouter();
  const { events, isLoading, handleSearch, handleFilterDate, toggleSort, sortAsc } = useEventList();
  const { handleDelete, deleteLoading } = useDeleteEvent();

  const columns: ColumnDef<Event, unknown>[] = [
    columnHelper.accessor("name", { header: "Event", size: 220, cell: (info: any) => (
      <div>
        <p className="font-medium text-foreground">{info.getValue()}</p>
        <p className="text-xs text-muted mt-0.5 truncate max-w-[200px]">{info.row.original.description || ""}</p>
      </div>
    )}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("date", { header: "Date", size: 160, cell: (info: any) => (
      <div>
        <p className="text-sm font-medium">{formatDate(info.getValue())}</p>
        <p className="text-xs text-muted mt-0.5">{daysUntil(info.getValue())}</p>
      </div>
    )}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("location", { header: "Location", size: 160, cell: (info: any) => (
      <span className="text-sm text-muted">{info.getValue() || "—"}</span>
    )}) as ColumnDef<Event, unknown>,
    columnHelper.accessor("participant_count", { header: "Participants", size: 100, cell: (info: any) => (
      <span className="text-sm font-semibold">{info.getValue() ?? 0}</span>
    )}) as ColumnDef<Event, unknown>,
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
  const past = total - upcoming;
  const uniqueLocations = new Set(events.map((e) => e.location).filter(Boolean)).size;

  return (
    <>
      <SetPageMeta title="Events" headerExtra={<Button onClick={() => router.push("/events/create")}><Plus size={16} /> Create Event</Button>} />
      <div className="page-container space-y-6 pb-12 page-enter">
        {!isLoading && total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card p-4" style={{ "--accent": "var(--color-primary)" } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Calendar size={16} /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Total</span>
              </div>
              <p className="text-2xl font-black text-foreground">{total}</p>
            </div>
            <div className="stat-card p-4" style={{ "--accent": "var(--color-accent-teal)" } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-accent-teal/10 flex items-center justify-center text-accent-teal"><Clock size={16} /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Upcoming</span>
              </div>
              <p className="text-2xl font-black text-foreground">{upcoming}</p>
            </div>
            <div className="stat-card p-4" style={{ "--accent": "var(--color-base-400)" } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-base-400/10 flex items-center justify-center text-base-400"><Calendar size={16} /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Past</span>
              </div>
              <p className="text-2xl font-black text-foreground">{past}</p>
            </div>
            <div className="stat-card p-4" style={{ "--accent": "var(--color-accent-blue)" } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue"><MapPin size={16} /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Locations</span>
              </div>
              <p className="text-2xl font-black text-foreground">{uniqueLocations}</p>
            </div>
          </div>
        )}

        {(total > 0 || isLoading) && (
          <SearchBar
            placeholder="Search by name..."
            onSearch={handleSearch}
            onDateFilter={handleFilterDate}
            onSortToggle={toggleSort}
            sortLabel={sortAsc ? "Oldest" : "Newest"}
            showDateFilter
            showSort
          />
        )}

        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : events.length === 0 ? (
          <div className="card-surface flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Calendar size={28} className="text-primary" /></div>
            <p className="text-base font-semibold text-foreground">No events found</p>
            <p className="text-sm text-muted">Create your first event to get started</p>
            <Button onClick={() => router.push("/events/create")}><Plus size={16} /> Create Event</Button>
          </div>
        ) : (
          <div className="card-surface overflow-hidden p-0">
            <DataTable columns={columns} data={events} filterColumn="name" filterPlaceholder="Search events..." />
          </div>
        )}
      </div>
    </>
  );
}
