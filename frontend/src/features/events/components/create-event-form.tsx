"use client";

import { useCreateEvent } from "../hooks";
import { useRouter } from "next/navigation";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Input, TimePicker, Select, StatusDropdown } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationSearch } from "@/components/ui/location-search";
import { CoverUpload } from "./cover-upload";
import { EVENT_CATEGORIES } from "@/common/types";
import { Users, Tag } from "lucide-react";

export function CreateEventForm() {
  const router = useRouter();
  const { form, errors, isLoading, setField, handleSubmit } = useCreateEvent();

  return (
    <>
      <SetPageMeta title="Create Event" backHref="/events" />
      <div className="page-container max-w-3xl page-enter">
        <form onSubmit={handleSubmit} className="space-y-8">
          <CoverUpload onUrlChange={(url) => setField("cover_image_url", url)} />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Event Name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                error={errors.name}
                placeholder="e.g. Beach Cleanup Drive"
                maxLength={100}
              />
            </div>
            <Select
              label="Category"
              value={form.category || "other"}
              onChange={(val) => setField("category", val)}
              options={EVENT_CATEGORIES}
              icon={<Tag size={15} />}
            />
            <div className="form-field">
              <label className="text-label font-medium text-foreground">Status</label>
              <div className="pt-1.5">
                <StatusDropdown
                  value={form.status as any || "backlog"}
                  onChange={(val) => setField("status", val)}
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="text-label font-medium text-foreground">Description</label>
            <textarea
              className="form-input min-h-[140px] resize-y"
              value={form.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe what volunteers will do, what to bring, meeting point details, dress code..."
            />
            {errors.description && <p className="text-error mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Event Date"
              value={form.date}
              onChange={(date) => setField("date", date)}
              error={errors.date}
            />
            <div className="grid grid-cols-2 gap-2">
              <TimePicker
                label="Start Time"
                value={form.start_time || ""}
                onChange={(val) => setField("start_time", val)}
                error={errors.start_time}
              />
              <TimePicker
                label="End Time"
                value={form.end_time || ""}
                onChange={(val) => setField("end_time", val)}
                error={errors.end_time}
              />
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
              <label className="text-label font-medium text-foreground">Max Participants</label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  value={form.max_participants || ""}
                  onChange={(e) => setField("max_participants", e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="Unlimited"
                  className="form-input !pl-10 w-full"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border pb-8">
            <Button type="button" variant="ghost" onClick={() => router.push("/events")}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} size="lg">
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
