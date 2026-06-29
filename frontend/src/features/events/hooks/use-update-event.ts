import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpdateEventMutation, useGetEventQuery } from "../services";
import { updateEventSchema, notify } from "@/common/utils";
import type { UpdateEventPayload } from "@/common/types";

interface FormErrors { name?: string; description?: string; date?: string; location?: string; category?: string; max_participants?: string; registration_deadline?: string; start_time?: string; end_time?: string; cover_image_url?: string }

export function useUpdateEvent(eventId: string) {
  const router = useRouter();
  const { data: eventData } = useGetEventQuery(eventId, { skip: !eventId });
  const [form, setForm] = useState<UpdateEventPayload>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const event = eventData ?? null;

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name,
        description: event.description || "",
        date: event.date,
        location: event.location || "",
        category: event.category || "other",
        max_participants: event.max_participants ?? undefined,
        start_time: event.start_time ?? undefined,
        end_time: event.end_time ?? undefined,
        registration_deadline: event.registration_deadline ?? undefined,
        cover_image_url: event.cover_image_url ?? undefined,
      });
    }
  }, [event]);

  const setField = (field: keyof UpdateEventPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateEventSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => { const field = err.path[0] as keyof FormErrors; fieldErrors[field] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      await updateEvent({ eventId, data: form }).unwrap();
      notify.success("Event updated successfully!");
      setTimeout(() => router.push(`/events/${eventId}`), 300);
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      notify.error(error?.data?.error?.message || "Failed to update event");
    }
  };

  return { form, errors, isLoading, event, setField, handleSubmit };
}
