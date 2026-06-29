import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEventMutation } from "../services";
import { createEventSchema } from "@/common/utils";
import type { CreateEventPayload } from "@/common/types";

interface FormErrors { name?: string; description?: string; date?: string; location?: string }

const initialForm: CreateEventPayload = { name: "", description: "", date: "", location: "" };

export function useCreateEvent() {
  const router = useRouter();
  const [form, setForm] = useState<CreateEventPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const setField = (field: keyof CreateEventPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const result = createEventSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => { const field = err.path[0] as keyof FormErrors; fieldErrors[field] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    try { await createEvent(form).unwrap(); router.push("/events"); } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      setApiError(error?.data?.error?.message || "Failed to create event");
    }
  };

  return { form, errors, apiError, isLoading, setField, handleSubmit };
}
