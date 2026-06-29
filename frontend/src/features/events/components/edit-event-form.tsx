"use client";

import { useParams, useRouter } from "next/navigation";
import { useUpdateEvent } from "../hooks";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, AuthenticatedLayout, SkeletonForm, SkeletonHeading } from "@/components/ui";

export function EditEventForm() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId || "";
  const router = useRouter();
  const { form, errors, apiError, isLoading, event, setField, handleSubmit } = useUpdateEvent(eventId);

  if (!event) {
    return (
      <AuthenticatedLayout>
        <div className="mx-auto max-w-2xl space-y-4">
          <SkeletonHeading className="w-48" />
          <SkeletonForm fields={4} />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Edit Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && <p className="text-error text-center">{apiError}</p>}
              <Input label="Event Name" value={form.name || ""} onChange={(e) => setField("name", e.target.value)} error={errors.name} />
              <div className="form-field">
                <label className="text-label">Description</label>
                <textarea className="form-input min-h-[100px] resize-y" value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
                {errors.description && <p className="text-error">{errors.description}</p>}
              </div>
              <Input label="Date" type="date" value={form.date || ""} onChange={(e) => setField("date", e.target.value)} error={errors.date} />
              <Input label="Location" value={form.location || ""} onChange={(e) => setField("location", e.target.value)} error={errors.location} />
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={isLoading}>Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => router.push(`/events/${eventId}`)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
