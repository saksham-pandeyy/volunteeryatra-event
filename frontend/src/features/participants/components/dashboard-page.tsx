"use client";

import { useState } from "react";
import type { ChartType } from "@/components/ui/charts";
import { useRouter } from "next/navigation";
import { useListEventsQuery, useDeleteEventMutation } from "@/features/events/services";
import { useDashboardStats } from "@/features/events/hooks";
import { useParticipants } from "../hooks";
import { DashboardStatsSection } from "./dashboard-stats-section";
import { CancelRegistrationModal } from "./dashboard-cancel-modal";
import { useEventTableColumns } from "./use-event-table-columns";
import { useParticipantTableColumns } from "./use-participant-table-columns";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Card, CardHeader, CardTitle, CardContent, DataTable, SkeletonTable, Badge, Modal } from "@/components/ui";
import { notify } from "@/common/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import type { Event } from "@/common/types";
import type { Participant } from "@/common/types";
import { Calendar, Plus, Zap, ArrowRight, Eye, AlertTriangle } from "lucide-react";

export function DashboardPage() {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Participant | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const { data: eventsData, isLoading: eventsLoading } = useListEventsQuery({});
  const events: Event[] = eventsData?.data ?? [];
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();

  const [chartType, setChartType] = useState<ChartType>("bar");
  const { stats, isLoading: statsLoading, trend, dateRange, setDateRange, dateRangeLabel } = useDashboardStats();

  const { participants, isLoading: participantsLoading, error: participantsError, handleCancel, cancelLoading } = useParticipants(selectedEventId || "");

  const eventColumns = useEventTableColumns({
    selectedEventId,
    onSelect: setSelectedEventId,
    onOpen: (id) => router.push(`/events/${id}`),
    onDelete: setDeleteTarget,
  });
  const participantColumns = useParticipantTableColumns({ onCancel: setCancelTarget });

  const onCancelConfirm = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    try {
      await handleCancel(cancelTarget.id, cancelReason);
      notify.success("Registration cancelled");
      setCancelTarget(null);
      setCancelReason("");
    } catch {
      notify.error("Failed to cancel registration");
    }
  };

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

  const recentEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date()).slice(0, 3);

  return (
    <>
      <SetPageMeta
        title="Dashboard"
        headerExtra={
          <Button size="sm" onClick={() => router.push("/events/create")}>
            <Plus size={14} /> Add Event
          </Button>
        }
      />
      <div className="page-container space-y-6 pb-12 page-enter">
        {/* Header description + Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-2">
          <p className="text-sm font-medium text-muted leading-relaxed max-w-2xl">
            Track your volunteer events, monitor participation, and manage registrations at a glance.
          </p>
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {statsLoading ? (
          <DashboardStatsSection stats={null} dateRangeLabel={dateRangeLabel} trend={null} isLoading={true} chartType={chartType} onChartTypeChange={setChartType} />
        ) : stats ? (
          <DashboardStatsSection stats={stats} dateRangeLabel={dateRangeLabel} trend={trend} isLoading={false} chartType={chartType} onChartTypeChange={setChartType} />
        ) : null}

        {!eventsLoading && (
          <>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => router.push("/events/create")} className="card-surface flex items-center gap-4 p-4 hover:border-primary/40 transition-all cursor-pointer text-left">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Plus size={20} strokeWidth={2} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Create Event</p>
                    <p className="text-xs text-muted mt-0.5">Set up a new volunteer event</p>
                  </div>
                  <ArrowRight size={16} className="text-muted shrink-0" />
                </button>
                <button onClick={() => router.push("/events")} className="card-surface flex items-center gap-4 p-4 hover:border-primary/40 transition-all cursor-pointer text-left">
                  <div className="h-10 w-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0"><Calendar size={20} strokeWidth={2} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">All Events</p>
                    <p className="text-xs text-muted mt-0.5">{events.length} total</p>
                  </div>
                  <ArrowRight size={16} className="text-muted shrink-0" />
                </button>
                {upcomingEvents.length > 0 && (
                  <div className="card-surface p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber shrink-0"><Zap size={20} strokeWidth={2} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">Next Up</p>
                      <p className="text-xs text-muted mt-0.5 truncate">{upcomingEvents[0].name}</p>
                    </div>
                    <Badge variant="warning" className="shrink-0">Soon</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar size={28} className="text-primary" />
                </div>
                <p className="text-base font-semibold text-foreground">No events yet</p>
                <p className="text-sm text-muted">Create your first event to see insights here</p>
                <Button onClick={() => router.push("/events/create")}>Create Your First Event</Button>
              </div>
            )}
          </>
        )}

        {events.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Your Events</h2>
              {events.length > 5 && (
                <Button size="sm" variant="ghost" onClick={() => router.push("/events")}>
                  <Eye size={14} /> View All ({events.length})
                </Button>
              )}
            </div>
            {eventsLoading ? (
              <SkeletonTable rows={4} />
            ) : (
              <DataTable
                columns={eventColumns}
                data={recentEvents}
                enableFiltering={false}
                onRowClick={(row) => setSelectedEventId(row.id)}
                rowClassName="cursor-pointer"
              />
            )}
          </div>
        )}

        {selectedEventId && (
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <span className="text-xs text-muted">{participants.length} registered</span>
            </CardHeader>
            <CardContent>
              {participantsLoading ? <SkeletonTable rows={4} /> : participantsError ? (
                <div className="flex-center py-8"><p className="text-sm text-muted">Failed to load participants</p></div>
              ) : participants.length === 0 ? (
                <div className="flex-center py-8"><p className="text-sm text-muted">No participants yet</p></div>
              ) : <DataTable columns={participantColumns} data={participants} enableFiltering={false} />}
            </CardContent>
          </Card>
        )}
      </div>

      <CancelRegistrationModal
        cancelTarget={cancelTarget} cancelReason={cancelReason} cancelLoading={cancelLoading}
        onClose={() => { setCancelTarget(null); setCancelReason(""); }}
        onReasonChange={setCancelReason} onConfirm={onCancelConfirm}
      />

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
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>? This action cannot be undone and will cancel all volunteer registrations for this event.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteConfirm}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
