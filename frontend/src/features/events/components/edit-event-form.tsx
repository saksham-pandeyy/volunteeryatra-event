"use client";

import { useParams, useRouter } from "next/navigation";
import { useUpdateEvent, useCoverUpload } from "../hooks";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Input, SkeletonForm, SkeletonHeading } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationSearch } from "@/components/ui/location-search";
import { EVENT_CATEGORIES } from "@/common/types";
import { Upload, X, Clock, Users, Tag } from "lucide-react";

export function EditEventForm() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId || "";
  const router = useRouter();
  const { form, errors, isLoading, event, setField, handleSubmit } = useUpdateEvent(eventId);

  // Sync cover preview when event loads
  const initialCoverUrl = event?.cover_image_url
    ? `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace("/api", "")}${event.cover_image_url}`
    : null;

  const { preview, uploading, fileInputRef, handleSelect, handleRemove } = useCoverUpload({
    initialUrl: initialCoverUrl,
    onUrlChange: (url) => setField("cover_image_url", url),
  });

  if (!event) {
    return (
      <>
        <SetPageMeta title="Edit Event" backHref={eventId ? `/events/${eventId}` : "/events"} />
        <div className="mx-auto max-w-2xl space-y-4">
          <SkeletonHeading className="w-48" />
          <SkeletonForm fields={6} />
        </div>
      </>
    );
  }

  return (
    <>
      <SetPageMeta title="Edit Event" backHref={`/events/${eventId}`} />
      <div className="max-w-3xl mx-auto page-enter">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-surface p-0 overflow-hidden">
            {preview ? (
              <div className="relative h-48 sm:h-56 bg-surface-hover">
                <img src={preview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-surface-hover/50">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Upload size={22} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Event Cover Image</p>
                <p className="text-xs text-muted mb-4">Upload a photo (max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSelect}
                  className="hidden"
                  id="edit-cover-upload"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Choose Image
                </Button>
              </div>
            )}
          </div>

          <div className="card-surface p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
              <div className="h-8 w-1 rounded-full bg-primary" />
              <div>
                <h2 className="text-base font-bold text-foreground">Event Details</h2>
                <p className="text-xs text-muted mt-0.5">Update your event information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Event Name"
                  value={form.name || ""}
                  onChange={(e) => setField("name", e.target.value)}
                  error={errors.name}
                  placeholder="e.g. Beach Cleanup Drive"
                  maxLength={100}
                />
              </div>
              <div className="form-field">
                <label className="text-label">Category</label>
                <div className="relative">
                  <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <select
                    value={form.category || "other"}
                    onChange={(e) => setField("category", e.target.value)}
                    className="form-input pl-10 appearance-none cursor-pointer w-full"
                    style={{ borderRadius: "8px" }}
                  >
                    {EVENT_CATEGORIES.map((cat: { value: string; label: string }) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="text-label">Description</label>
              <textarea
                className="form-input min-h-[140px] resize-y"
                value={form.description || ""}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe what volunteers will do..."
              />
              {errors.description && <p className="text-error mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Event Date"
                value={form.date || ""}
                onChange={(date) => setField("date", date)}
                error={errors.date}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="form-field">
                  <label className="text-label">Start Time</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="time"
                      value={form.start_time || ""}
                      onChange={(e) => setField("start_time", e.target.value)}
                      className="form-input pl-10 w-full"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="text-label">End Time</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="time"
                      value={form.end_time || ""}
                      onChange={(e) => setField("end_time", e.target.value)}
                      className="form-input pl-10 w-full"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <LocationSearch
              label="Location"
              value={form.location || ""}
              onChange={(val) => setField("location", val)}
              error={errors.location}
              placeholder="Search for a location..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-field">
                <label className="text-label">Max Participants</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    value={form.max_participants || ""}
                    onChange={(e) => setField("max_participants", e.target.value ? parseInt(e.target.value) : 0)}
                    placeholder="Unlimited"
                    className="form-input pl-10 w-full"
                    style={{ borderRadius: "8px" }}
                  />
                </div>
                {errors.max_participants && <p className="text-error mt-1">{errors.max_participants}</p>}
              </div>
              <DatePicker
                label="Registration Deadline"
                value={form.registration_deadline || ""}
                onChange={(date) => setField("registration_deadline", date)}
                error={errors.registration_deadline}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pb-8">
            <Button type="submit" loading={isLoading || uploading} size="lg">
              {uploading ? "Uploading..." : "Save Changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push(`/events/${eventId}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
