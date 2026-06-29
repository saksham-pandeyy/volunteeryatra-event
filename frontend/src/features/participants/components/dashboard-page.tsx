"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListEventsQuery } from "@/features/events/services";
import { useDashboardStats } from "@/features/events/hooks";
import { useParticipants } from "../hooks";
import { DashboardStatsSection } from "./dashboard-stats-section";
import { CancelRegistrationModal } from "./dashboard-cancel-modal";
import { useEventTableColumns } from "./use-event-table-columns";
import { useParticipantTableColumns } from "./use-participant-table-columns";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Card, CardHeader, CardTitle, CardContent, DataTable, SkeletonTable, Badge } from "@/components/ui";
import { notify } from "@/common/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import type { Event } from "@/common/types";
import type { Participant } from "@/common/types";
import { Calendar, Plus, Zap, ArrowRight } from "lucide-react";

export function DashboardPage() {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Participant | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: eventsData, isLoading: eventsLoading } = useListEventsQuery({});
  const events: Event[] = eventsData ?? [];

  const { stats, isLoading: statsLoading, trend, dateRange, setDateRange, dateRangeLabel } = useDashboardStats();

  const { participants, isLoading: participantsLoading, error: participantsError, handleCancel, cancelLoading } = useParticipants(selectedEventId || "");

  const eventColumns = useEventTableColumns({ selectedEventId, onSelect: setSelectedEventId, onOpen: (id) => router.push(`/events/${id}`) });
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

  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date()).slice(0, 3);

  return (
    <>
      <SetPageMeta title="Dashboard" headerExtra={<DateRangePicker value={dateRange} onChange={setDateRange} />} />
      <div className="page-container space-y-6 pb-12 page-enter">
        {statsLoading ? (
          <DashboardStatsSection stats={null} dateRangeLabel={dateRangeLabel} trend={null} isLoading={true} />
        ) : stats ? (
          <DashboardStatsSection stats={stats} dateRangeLabel={dateRangeLabel} trend={trend} isLoading={false} />
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
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
              <Button size="sm" variant="secondary" onClick={() => router.push("/events/create")}><Plus size={14} /> New Event</Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? <SkeletonTable rows={4} /> : <DataTable columns={eventColumns} data={events} enableFiltering={false} />}
            </CardContent>
          </Card>
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
    </>
  );
}
