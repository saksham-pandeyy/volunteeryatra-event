"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventList } from "../hooks";
import { useDeleteEventMutation } from "../services";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, SkeletonTable, StatsCard, Modal, SkeletonStatCard } from "@/components/ui";
import { EventTable } from "./event-table";
import { notify } from "@/common/utils";

import { isUpcoming } from "@/common/utils";
import type { Event } from "@/common/types";
import { Plus, Calendar, MapPin, Clock, CalendarDays, AlertTriangle } from "lucide-react";

export function EventListPage() {
  const router = useRouter();
  const { events, isLoading, handleSearch, handleFilterDateRange, handleFilterStatus, handlePageChange, filters, pagination, page } = useEventList();
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();

  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id).unwrap();
      notify.success("Event deleted successfully");
      setDeleteTarget(null);
    } catch {
      notify.error("Failed to delete event");
    }
  };

  const upcoming = events.filter((e) => isUpcoming(e.date)).length;
  const total = events.length;
  const past = total - upcoming;
  const uniqueLocations = new Set(events.map((e) => e.location).filter(Boolean)).size;

  return (
    <>
      <SetPageMeta title="Events" headerExtra={<Button onClick={() => router.push("/events/create")}><Plus size={16} /> Create Event</Button>} />
      <div className="page-container space-y-6 pb-12 page-enter">
        {isLoading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-border bg-surface px-4 py-3 rounded-lg">
              <div className="skeleton h-9 w-64 rounded-lg" style={{ minWidth: "16rem" }} />
              <div className="flex items-center gap-3">
                <div className="skeleton h-9 w-[160px] rounded-lg" />
                <div className="skeleton h-9 w-[180px] rounded-lg" />
                <div className="skeleton h-9 w-9 rounded-lg" style={{ marginLeft: "8px" }} />
              </div>
            </div>

            <SkeletonTable rows={6} />
          </>
        ) : total > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Total Events" value={total} icon={Calendar} accentColor="var(--color-primary)" />
              <StatsCard title="Upcoming" value={upcoming} icon={Clock} accentColor="var(--color-accent-teal)" />
              <StatsCard title="Past Events" value={past} icon={CalendarDays} accentColor="var(--color-base-400)" />
              <StatsCard title="Locations" value={uniqueLocations} icon={MapPin} accentColor="var(--color-accent-blue)" />
            </div>

            <EventTable
              events={events}
              filters={filters}
              handleSearch={handleSearch}
              handleFilterStatus={handleFilterStatus}
              handleFilterDateRange={handleFilterDateRange}
              onDeleteClick={setDeleteTarget}
              pagination={pagination}
              page={page}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="card-surface flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Calendar size={28} className="text-primary" /></div>
            <p className="text-base font-semibold text-foreground">No events found</p>
            <p className="text-sm text-muted">Create your first event to get started</p>
            <Button onClick={() => router.push("/events/create")}><Plus size={16} /> Create Event</Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Event"
        icon={
          <div className="h-14 w-14 rounded-2xl bg-danger-muted flex items-center justify-center">
            <AlertTriangle size={28} className="text-danger" />
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        confirmLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      >
        <p className="text-sm text-muted leading-relaxed">
          Are you sure you want to delete <strong className="text-foreground">{deleteTarget?.name}</strong>?
          This action cannot be undone. All participant data for this event will also be removed.
        </p>
      </Modal>
    </>
  );
}
