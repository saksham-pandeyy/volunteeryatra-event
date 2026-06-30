import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required").refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  location: z.string().optional(),
  category: z.string().optional(),
  max_participants: z.number().int("Must be a whole number").positive("Must be at least 1").optional(),
  registration_deadline: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  cover_image_url: z.string().optional(),
  status: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const applyToEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const cancelRegistrationSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});
