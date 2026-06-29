import { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import {
  applyToEvent,
  findParticipantsByEvent,
  findParticipantById,
  cancelParticipant,
} from "./participants.model";
import { findEventById } from "../events/events.model";
import { NotFoundError, ForbiddenError } from "../../shared/errors";
import { sendEmail, registrationConfirmationHtml } from "../../services/email";

const applySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
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
