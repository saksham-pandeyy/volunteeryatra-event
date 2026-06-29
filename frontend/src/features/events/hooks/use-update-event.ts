import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpdateEventMutation, useGetEventQuery } from "../services";
import { updateEventSchema } from "@/common/utils";
import type { UpdateEventPayload } from "@/common/types";

interface FormErrors { name?: string; description?: string; date?: string; location?: string }

export function useUpdateEvent(eventId: string) {
  const router = useRouter();
  const { data: eventData } = useGetEventQuery(eventId, { skip: !eventId });
  const [form, setForm] = useState<UpdateEventPayload>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const event = eventData?.success ? eventData.data : null;

  useEffect(() => {
    if (event) setForm({ name: event.name, description: event.description || "", date: event.date, location: event.location || "" });
  }, [event]);

  const setField = (field: keyof UpdateEventPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const result = updateEventSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => { const field = err.path[0] as keyof FormErrors; fieldErrors[field] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    try { await updateEvent({ eventId, data: form }).unwrap(); router.push(`/events/${eventId}`); } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      setApiError(error?.data?.error?.message || "Failed to update event");
    }
  };

  return { form, errors, apiError, isLoading, event, setField, handleSubmit };
}
