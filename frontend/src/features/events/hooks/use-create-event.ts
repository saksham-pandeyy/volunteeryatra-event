import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEventMutation } from "../services";
import { createEventSchema, notify } from "@/common/utils";
import type { CreateEventPayload } from "@/common/types";

interface FormErrors { name?: string; description?: string; date?: string; location?: string; category?: string; max_participants?: string; registration_deadline?: string; start_time?: string; end_time?: string; cover_image_url?: string }

const initialForm: CreateEventPayload = { name: "", description: "", date: "", location: "", category: "other" };

export function useCreateEvent() {
  const router = useRouter();
  const [form, setForm] = useState<CreateEventPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const setField = (field: keyof CreateEventPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createEventSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => { const field = err.path[0] as keyof FormErrors; fieldErrors[field] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      await createEvent(form).unwrap();
      notify.success("Event created successfully!");
      setTimeout(() => router.push("/events"), 300);
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      notify.error(error?.data?.error?.message || "Failed to create event");
    }
  };

  return { form, errors, isLoading, setField, handleSubmit };
}
