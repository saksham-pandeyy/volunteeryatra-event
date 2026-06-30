import { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import {
  applyToEvent,
  findParticipantsByEvent,
  findParticipantById,
  findParticipantByEventAndUser,
  reactivateParticipant,
  cancelParticipant,
} from "./participants.model";
import { findEventById } from "../events/events.model";
import { NotFoundError, ForbiddenError } from "../../shared/errors";
import { supabase } from "../../config/database";
import { sendEmail, registrationConfirmationHtml } from "../../services/email";

const applySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const addParticipantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  user_id: z.string().optional(),
});

const cancelSchema = z.object({
  reason: z.string().min(1),
});

function param(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] || "";
  return "";
}

export async function apply(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");

    // Check max participants
    if (event.max_participants) {
      const participants = await findParticipantsByEvent(eventId);
      if (participants.length >= event.max_participants) {
        res.status(400).json({ success: false, error: { code: "EVENT_FULL", message: "This event has reached its maximum capacity" } });
        return;
      }
    }

    // Check registration deadline
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      if (new Date() > deadline) {
        res.status(400).json({ success: false, error: { code: "DEADLINE_PASSED", message: "Registration deadline has passed" } });
        return;
      }
    }

    const body = applySchema.parse(req.body);

    // Check for duplicate registration
    const existing = await findParticipantByEventAndUser(eventId, req.userId!, body.email);
    if (existing) {
      if (existing.status === "applied") {
        res.status(409).json({ success: false, error: { code: "ALREADY_APPLIED", message: "You have already applied to this event" } });
        return;
      }
      if (existing.status === "cancelled") {
        // Re-activate the cancelled registration
        const reactivated = await reactivateParticipant(existing.id);
        res.json({ success: true, data: reactivated, message: "Your registration has been re-activated" });
        return;
      }
    }

    const participant = await applyToEvent({
      event_id: eventId,
      user_id: req.userId!,
      ...body,
    });

    // Send confirmation email (fire-and-forget — don't block response)
    const eventDate = event.date 
      ? new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : "TBD";
    
    sendEmail({
      to: body.email,
      subject: `Confirmed! You're registered for ${event.name}`,
      html: registrationConfirmationHtml(event.name, body.name, eventDate, event.location),
    });

    res.status(201).json({ success: true, data: participant });
  } catch (error) {
    next(error);
  }
}

export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the owner can view participants");
    }

    const participants = await findParticipantsByEvent(eventId);
    res.json({ success: true, data: participants });
  } catch (error) {
    next(error);
  }
}

export async function add(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");

    // Only owner can add participants manually
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the event owner can add participants");
    }

    // Check max participants
    if (event.max_participants) {
      const participants = await findParticipantsByEvent(eventId);
      if (participants.length >= event.max_participants) {
        res.status(400).json({ success: false, error: { code: "EVENT_FULL", message: "This event has reached its maximum capacity" } });
        return;
      }
    }

    const body = addParticipantSchema.parse(req.body);

    // Resolve user_id: use provided ID, look up by email, or null for guest volunteers
    let userId: string | null = body.user_id || null;
    if (!userId) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", body.email)
        .maybeSingle();
      if (existingUser) {
        userId = existingUser.id;
      }
      // If no user found, userId stays null — volunteer without account
    }

    // Check for duplicate registration
    const existing = await findParticipantByEventAndUser(eventId, userId, body.email);
    if (existing) {
      if (existing.status === "applied") {
        res.status(409).json({ success: false, error: { code: "ALREADY_APPLIED", message: "This person has already been registered for this event" } });
        return;
      }
      if (existing.status === "cancelled") {
        // Re-activate the cancelled registration
        const reactivated = await reactivateParticipant(existing.id);
        res.json({ success: true, data: reactivated, message: "Registration re-activated" });
        return;
      }
    }

    const participant = await applyToEvent({
      event_id: eventId,
      user_id: userId,
      name: body.name,
      email: body.email,
    });

    // Send confirmation email
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : "TBD";

    sendEmail({
      to: body.email,
      subject: `You've been registered for ${event.name}`,
      html: registrationConfirmationHtml(event.name, body.name, eventDate, event.location),
    });

    res.status(201).json({ success: true, data: participant });
  } catch (error) {
    next(error);
  }
}

export async function cancel(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const participantId = param(req.params.participantId);

    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the owner can cancel registrations");
    }

    const participant = await findParticipantById(participantId);
    if (!participant) throw new NotFoundError("Participant");

    const { reason } = cancelSchema.parse(req.body);
    const updated = await cancelParticipant(participantId, reason);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
