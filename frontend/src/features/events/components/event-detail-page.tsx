"use client";

import { useRouter } from "next/navigation";
import { useEventDetail, useDeleteEvent } from "../hooks";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Badge, EventNotFound, SkeletonHeading, SkeletonCard } from "@/components/ui";
import { EventMap } from "./event-map";
import { formatDate, isUpcoming, daysUntil } from "@/common/utils";
import { Calendar, MapPin, Users, Tag, BarChart3 } from "lucide-react";
import { EVENT_CATEGORIES } from "@/common/types";

export function EventDetailPage() {
  const router = useRouter();
  const { event, isLoading, eventId } = useEventDetail();
  const { handleDelete, deleteLoading } = useDeleteEvent();

  if (isLoading) {
    return (
      <>
        <SetPageMeta title="Event Details" backHref="/events" />
        <div className="page-container space-y-4">
          <SkeletonHeading className="w-64" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <SetPageMeta title="Event Not Found" backHref="/events" />
        <div className="page-container"><EventNotFound /></div>
      </>
    );
  }

  const handleDeleteEvent = async () => {
    await handleDelete(eventId);
    router.push("/events");
  };

  const upcoming = isUpcoming(event.date);
  const categoryLabel = EVENT_CATEGORIES.find((c: { value: string; label: string }) => c.value === event.category)?.label || "Other";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";
  const coverSrc = event.cover_image_url ? `${apiUrl}${event.cover_image_url}` : null;

  return (
    <>
      <SetPageMeta title={event.name} backHref="/events" />
      <div className="page-container max-w-4xl space-y-6 page-enter">
        {coverSrc && (
          <div className="rounded-xl overflow-hidden border border-surface-border h-48 sm:h-64">
            <img src={coverSrc} alt={event.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="card-surface p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-foreground tracking-tight">{event.name}</h1>
                <Badge variant={upcoming ? "success" : "default"}>{upcoming ? "Upcoming" : "Past"}</Badge>
                <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">{categoryLabel}</Badge>
              </div>
              {upcoming && <p className="text-sm font-medium text-accent-teal">{daysUntil(event.date)}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" onClick={() => router.push(`/events/${eventId}/edit`)}>Edit</Button>
              <Button variant="danger" loading={deleteLoading} onClick={handleDeleteEvent}>Delete</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">            <div className="md:col-span-2 space-y-6">
            <div className="card-surface p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Event Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">Date</p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(event.date)}</p>
                    {event.start_time && (
                      <p className="text-xs text-muted">{event.start_time}{event.end_time ? ` – ${event.end_time}` : ""}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">Capacity</p>
                    <p className="text-sm font-semibold text-foreground">
                      {event.max_participants ? `${event.max_participants} max` : "Unlimited"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">Category</p>
                    <p className="text-sm font-semibold text-foreground">{categoryLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">Status</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{event.status.replace("_", " ")}</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="border-t border-surface-border pt-4">
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>

            {event.location && (
              <div className="card-surface p-0 overflow-hidden">
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <h2 className="text-sm font-bold text-foreground">Location</h2>
                  </div>
                  <p className="text-sm text-muted mb-3">{event.location}</p>
                </div>
                <EventMap location={event.location} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-surface p-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Registration</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Deadline</span>
                  <span className="font-medium">{event.registration_deadline ? formatDate(event.registration_deadline) : "Open"}</span>
                </div>
                <div className="border-t border-surface-border pt-3">
                  <p className="text-xs text-muted mb-3">Manage participant registrations from the dashboard.</p>
                  <Button onClick={() => router.push("/dashboard")} className="w-full">Go to Dashboard</Button>
                </div>
              </div>
            </div>

            <div className="card-surface p-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Info</h2>
              <div className="space-y-2 text-sm">
                <p className="text-muted">Created {formatDate(event.created_at)}</p>
                <p className="text-muted break-all text-[11px]">ID: {event.id.slice(0, 12)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
