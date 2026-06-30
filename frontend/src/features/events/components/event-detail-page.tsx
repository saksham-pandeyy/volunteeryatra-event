"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventDetail } from "../hooks";
import { useDeleteEventMutation } from "../services";
import { useAddParticipantMutation } from "@/features/participants/services";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Badge, EventNotFound, Modal, StatusDropdown, Input } from "@/components/ui";
import { useApplyToEvent } from "../hooks";
import { EventMap } from "./event-map";
import { formatDate, isUpcoming, daysUntil } from "@/common/utils";
import { notify } from "@/common/utils";
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  PenSquare,
  Trash2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Image,
  Target,
} from "lucide-react";
import { EVENT_CATEGORIES } from "@/common/types";

function SkeletonEventDetail() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 page-enter">
      {/* Cover */}
      <div className="rounded-2xl h-56 sm:h-72 skeleton" />

      {/* Header */}
      <div className="card-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="skeleton h-10 w-72 rounded-lg" />
            <div className="flex items-center gap-3">
              <div className="skeleton h-7 w-28 rounded-md" />
              <div className="skeleton h-7 w-24 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="skeleton h-9 w-20 rounded-lg" />
            <div className="skeleton h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Stats */}
          <div className="card-surface p-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-5 w-28 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              ))}
            </div>
            <div className="border-t border-surface-border mt-5 pt-5 space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          </div>
          {/* Map */}
          <div className="card-surface p-0 overflow-hidden skeleton h-56" />
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface p-6 space-y-4">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventDetailPage() {
  const router = useRouter();
  const { event, isLoading, error, eventId, refetch } = useEventDetail();
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {
    user,
    showConfirmModal: showApplyModal,
    setShowConfirmModal: setShowApplyModal,
    handleApply,
    isApplying,
    hasApplied,
  } = useApplyToEvent(eventId, refetch);

  const [addParticipant, { isLoading: isAddingParticipant }] = useAddParticipantMutation();
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");

  const handleAddParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantEmail.trim()) {
      notify.error("Please enter both name and email");
      return;
    }
    addParticipant({
      eventId,
      data: { name: newParticipantName.trim(), email: newParticipantEmail.trim() },
    })
      .unwrap()
      .then(() => {
        notify.success(`${newParticipantName.trim()} has been registered successfully!`);
        setShowAddParticipantModal(false);
        setNewParticipantName("");
        setNewParticipantEmail("");
        refetch();
      })
      .catch((err: unknown) => {
        const message =
          (err as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          "Failed to add participant.";
        notify.error(message);
      });
  };

  const handleDeleteConfirm = async () => {
    const promise = deleteEvent(eventId).unwrap().then(() => {
      setTimeout(() => router.push("/events"), 600);
    });
    notify.promise(promise, {
      loading: "Deleting event...",
      success: "Event deleted successfully",
      error: "Failed to delete event",
    });
  };

  // Loading
  if (isLoading) {
    return (
      <>
        <SetPageMeta title="Event Details" backHref="/events" />
        <SkeletonEventDetail />
      </>
    );
  }

  // Error
  if (error && !event) {
    return (
      <>
        <SetPageMeta title="Error" backHref="/events" />
        <div className="page-container page-enter">
          <div className="max-w-md mx-auto card-surface flex flex-col items-center text-center py-16 gap-4">
            <div className="h-14 w-14 rounded-2xl bg-danger-muted flex items-center justify-center">
              <AlertTriangle size={28} className="text-danger" />
            </div>
            <p className="text-base font-semibold text-foreground">Failed to load event</p>
            <p className="text-sm text-muted max-w-xs">
              Something went wrong while fetching this event.
            </p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Not found
  if (!event) {
    return (
      <>
        <SetPageMeta title="Event Not Found" backHref="/events" />
        <div className="page-container">
          <EventNotFound />
        </div>
      </>
    );
  }

  const categoryLabel = EVENT_CATEGORIES.find((c) => c.value === event.category)?.label || "Other";
  // cover_image_url is now a full Supabase Storage URL, no prefix needed
  const coverSrc = event.cover_image_url || null;
  const participantCount = event.participant_count ?? 0;
  const maxCap = event.max_participants;
  const daysLeft = daysUntil(event.date);
  const isDeadlinePassed = event.registration_deadline ? !isUpcoming(event.registration_deadline) : false;
  const isEventPassed = !isUpcoming(event.date);
  const isOwner = user?.id === event.owner_id;

  let applyButtonText = "Apply Now";
  let applyDisabled = false;
  if (isOwner) {
    applyButtonText = "You're the Organizer";
    applyDisabled = true;
  } else if (hasApplied) {
    applyButtonText = "Already Registered";
    applyDisabled = true;
  } else if (isDeadlinePassed) {
    applyButtonText = "Registration Closed";
    applyDisabled = true;
  } else if (isEventPassed) {
    applyButtonText = "Event Ended";
    applyDisabled = true;
  } else if (maxCap && participantCount >= maxCap) {
    applyButtonText = "Fully Booked";
    applyDisabled = true;
  }

  return (
    <>
      <SetPageMeta
        title={event.name}
        headerExtra={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/events/${eventId}/edit`)}
            >
              <PenSquare size={14} /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        }
        backHref="/events"
      />
      <div className="page-container max-w-5xl space-y-6 pb-12 page-enter">

        {/* Cover */}
        {coverSrc && (
          <div className="relative rounded-2xl overflow-hidden border border-surface-border h-56 sm:h-72 group">
            <img
              src={coverSrc}
              alt={event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Hero Header */}
        <div className="card-surface p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {event.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <StatusDropdown value={event.status} eventId={event.id} />
              {event.category && (
                <span
                  className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                  style={{ borderRadius: "5px" }}
                >
                  <Tag size={11} className="mr-1" />
                  {categoryLabel}
                </span>
              )}
              {isUpcoming(event.date) && (
                <span
                  className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-bold bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                  style={{ borderRadius: "5px" }}
                >
                  <Clock size={11} className="mr-1" />
                  {daysLeft}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            {event.description ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            ) : (
              <p className="text-sm text-muted italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Stats */}
            <div className="card-surface p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    <Calendar size={12} className="inline mr-1 -mt-0.5" />
                    Date
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(event.date)}
                  </p>
                  {event.start_time && (
                    <p className="text-[11px] text-muted mt-0.5">
                      {event.start_time}{event.end_time ? ` \u2013 ${event.end_time}` : ""}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    <Users size={12} className="inline mr-1 -mt-0.5" />
                    Participants
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {maxCap ? `${participantCount} / ${maxCap}` : `${participantCount} registered`}
                  </p>
                  {maxCap && maxCap > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-base-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min((participantCount / maxCap) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted">
                        {Math.round((participantCount / maxCap) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    <Target size={12} className="inline mr-1 -mt-0.5" />
                    Registration
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {event.registration_deadline ? formatDate(event.registration_deadline) : "Open"}
                  </p>
                  {event.registration_deadline && (
                    <p className="text-[11px] text-muted mt-0.5">
                      {isUpcoming(event.registration_deadline) ? "Deadline pending" : "Passed"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    <MapPin size={12} className="inline mr-1 -mt-0.5" />
                    Location
                  </p>
                  <p className="text-sm font-bold text-foreground truncate" title={event.location || ""}>
                    {event.location || "Not set"}
                  </p>
                  {event.location && (
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-0.5 mt-0.5"
                    >
                      View on Maps <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            {event.location && (
              <div className="card-surface p-0 overflow-hidden">
                <EventMap location={event.location} />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Manage Card */}
            <div className="card-surface p-6">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Manage</h2>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  size="sm"
                  onClick={() => router.push(`/events/${eventId}/edit`)}
                >
                  <PenSquare size={14} /> Edit Event
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-center"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={14} /> Delete Event
                </Button>
                <div className="border-t border-surface-border pt-3">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full"
                    size="sm"
                  >
                    <ExternalLink size={14} /> Go to Dashboard
                  </Button>
                </div>
                {isOwner && (
                  <div className="border-t border-surface-border pt-3">
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      size="sm"
                      onClick={() => setShowAddParticipantModal(true)}
                    >
                      <Users size={14} /> Add Participant
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Card */}
            <div className="card-surface p-6">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Registration</h2>
              <Button
                className="w-full justify-center"
                size="sm"
                onClick={() => setShowApplyModal(true)}
                disabled={applyDisabled}
              >
                {applyButtonText}
              </Button>
              {maxCap && maxCap > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted text-xs">Capacity</span>
                    <span className="font-bold text-foreground">
                      {participantCount} / {maxCap}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-base-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min((participantCount / maxCap) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted">
                    {participantCount === 0
                      ? "No registrations yet"
                      : maxCap - participantCount > 0
                        ? `${maxCap - participantCount} spots remaining`
                        : "Fully booked"}
                  </p>
                </div>
              )}
            </div>

            {/* Event Info Card */}
            <div className="card-surface p-6">
              <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Event Info</h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Created</span>
                  <span className="text-xs font-medium">{formatDate(event.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Updated</span>
                  <span className="text-xs font-medium">{formatDate(event.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">ID</span>
                  <span className="text-xs font-mono text-muted truncate max-w-[100px]" title={event.id}>
                    {event.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Confirmation Modal */}
      <Modal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Confirm Registration"
        icon={
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users size={28} className="text-primary" />
          </div>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        confirmLoading={isApplying}
        disableActionsOnLoading
        onConfirm={handleApply}
      >
        <p className="text-sm text-muted leading-relaxed">
          You are about to register for{" "}
          <strong className="text-foreground">{event.name}</strong>. Your name
          and email will be shared with the event organizer.
        </p>
      </Modal>

      {/* Add Participant Modal */}
      <Modal
        open={showAddParticipantModal}
        onClose={() => {
          setShowAddParticipantModal(false);
          setNewParticipantName("");
          setNewParticipantEmail("");
        }}
        title="Add Participant"
        icon={
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users size={28} className="text-primary" />
          </div>
        }
        confirmText="Add"
        cancelText="Cancel"
        confirmLoading={isAddingParticipant}
        disableActionsOnLoading
        onConfirm={handleAddParticipant}
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-muted text-center">
            Register a volunteer for <strong className="text-foreground">{event.name}</strong>
          </p>
          <Input
            label="Name"
            placeholder="Enter participant name"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter participant email"
            value={newParticipantEmail}
            onChange={(e) => setNewParticipantEmail(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
        disableActionsOnLoading
        onConfirm={handleDeleteConfirm}
      >
        <p className="text-sm text-muted leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{event.name}</strong>? This action
          cannot be undone. All participant data will also be removed.
        </p>
      </Modal>
    </>
  );
}
