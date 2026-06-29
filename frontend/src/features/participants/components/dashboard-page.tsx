"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useListEventsQuery, useUpdateEventStatusMutation } from "@/features/events/services";
import { useDashboardStats } from "@/features/events/hooks";
import { useParticipants } from "../hooks";
import { DashboardStatsSection } from "./dashboard-stats-section";
import { CancelRegistrationModal } from "./dashboard-cancel-modal";
import { useEventTableColumns } from "./use-event-table-columns";
import { useParticipantTableColumns } from "./use-participant-table-columns";
import { Button, Card, CardHeader, CardTitle, CardContent, DataTable, EmptyState, AuthenticatedLayout, DateRangePicker, SkeletonTable } from "@/components/ui";
import type { DateRangePreset } from "@/components/ui";
import type { Event } from "@/common/types";
import type { Participant } from "@/common/types";

export function DashboardPage() {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Participant | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useListEventsQuery({});
  const events: Event[] = eventsData?.success ? eventsData.data : [];

  const { stats, isLoading: statsLoading, trend, dateRange, setDateRange, dateRangeLabel } = useDashboardStats();

  const { participants, isLoading: participantsLoading, error: participantsError, handleCancel, cancelLoading } = useParticipants(selectedEventId || "");

  const eventColumns = useEventTableColumns({ selectedEventId, onSelect: setSelectedEventId, onOpen: (id) => router.push(`/events/${id}`) });
  const participantColumns = useParticipantTableColumns({ onCancel: setCancelTarget });

  const onCancelConfirm = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    try {
      await handleCancel(cancelTarget.id, cancelReason);
      toast.success("Registration cancelled");
      setCancelTarget(null);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel registration");
    }
  };

  if (eventsError) {
    return (
      <AuthenticatedLayout>
        <EmptyState message="Failed to load events" description="Please try again later" />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      title="Dashboard"
      subtitle="Overview of your events and participants"
      headerExtra={<DateRangePicker value={dateRange} onChange={setDateRange} />}
    >
      <div className="page-container space-y-6 pb-12">

        {stats && (
          <DashboardStatsSection stats={stats} dateRangeLabel={dateRangeLabel} trend={trend} isLoading={statsLoading} />
        )}

        {events.length === 0 && !eventsLoading ? (
          <EmptyState message="No events created yet" description="Create an event to see insights and manage participants here" />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <Button size="sm" variant="secondary" onClick={() => router.push("/events/create")}>New Event</Button>
              </CardHeader>
              <CardContent>
                <DataTable columns={eventColumns} data={events} enableFiltering={false} />
              </CardContent>
            </Card>

            {selectedEventId && (
              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                  <span className="text-xs text-muted">{participants.length} registered</span>
                </CardHeader>
                <CardContent>
                  {participantsLoading ? (
                    <SkeletonTable rows={4} />
                  ) : participantsError ? (
                    <EmptyState message="Failed to load participants" />
                  ) : participants.length === 0 ? (
                    <EmptyState message="No participants yet" />
                  ) : (
                    <DataTable columns={participantColumns} data={participants} enableFiltering={false} />
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <CancelRegistrationModal
        cancelTarget={cancelTarget}
        cancelReason={cancelReason}
        cancelLoading={cancelLoading}
        onClose={() => { setCancelTarget(null); setCancelReason(""); }}
        onReasonChange={setCancelReason}
        onConfirm={onCancelConfirm}
      />
    </AuthenticatedLayout>
  );
}
