"use client";

import { useRouter } from "next/navigation";
import { useEventDetail } from "../hooks";
import { useDeleteEventMutation } from "../services";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, AuthenticatedLayout, EventNotFound, SkeletonHeading, SkeletonCard } from "@/components/ui";
import { formatDate, isUpcoming, daysUntil } from "@/common/utils";

export function EventDetailPage() {
  const router = useRouter();
  const { event, isLoading, eventId } = useEventDetail();
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="page-container space-y-4">
          <SkeletonHeading className="w-64" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!event) {
    return (
      <AuthenticatedLayout>
        <div className="page-container"><EventNotFound /></div>
      </AuthenticatedLayout>
    );
  }

  const handleDelete = async () => {
    await deleteEvent(eventId).unwrap();
    router.push("/events");
  };

  const upcoming = isUpcoming(event.date);
  const metaItems = [
    { label: "Date", value: formatDate(event.date) },
    { label: "Location", value: event.location || "Not specified" },
    { label: "Created", value: formatDate(event.created_at) },
    { label: "Event ID", value: event.id.slice(0, 8) + "..." },
  ];

  return (
    <AuthenticatedLayout>
      <div className="page-container max-w-4xl space-y-6">
        <button onClick={() => router.push("/events")} className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to events
        </button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{event.name}</CardTitle>
                  <Badge variant={upcoming ? "success" : "default"}>{upcoming ? "Upcoming" : "Past"}</Badge>
                </div>
                {upcoming && <p className="text-sm text-accent-teal font-medium">{daysUntil(event.date)}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => router.push(`/events/${eventId}/edit`)}>Edit</Button>
                <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {metaItems.map((item) => (
                <div key={item.label}>
                  <p className="text-accent mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            {event.description && (
              <div className="mt-6 border-t border-surface-border pt-6">
                <p className="text-accent mb-2">Description</p>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Registration</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-4">Participants can register for this event. Manage registrations from the dashboard.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
