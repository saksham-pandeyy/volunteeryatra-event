"use client";

import { useCreateEvent } from "../hooks";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, AuthenticatedLayout } from "@/components/ui";

export function CreateEventForm() {
  const { form, errors, apiError, isLoading, setField, handleSubmit } = useCreateEvent();

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Create Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && <p className="text-error text-center">{apiError}</p>}
              <Input label="Event Name" value={form.name} onChange={(e) => setField("name", e.target.value)} error={errors.name} placeholder="Enter event name" />
              <div className="form-field">
                <label className="text-label">Description</label>
                <textarea className="form-input min-h-[100px] resize-y" value={form.description || ""} onChange={(e) => setField("description", e.target.value)} placeholder="Describe your event" />
                {errors.description && <p className="text-error">{errors.description}</p>}
              </div>
              <Input label="Date" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} error={errors.date} />
              <Input label="Location" value={form.location || ""} onChange={(e) => setField("location", e.target.value)} error={errors.location} placeholder="Event location" />
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={isLoading}>Create Event</Button>
                <Button type="button" variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
