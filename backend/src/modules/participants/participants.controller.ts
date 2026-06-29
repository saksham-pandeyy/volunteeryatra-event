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

    const body = applySchema.parse(req.body);
    const participant = await applyToEvent({
      event_id: eventId,
      user_id: req.userId!,
      ...body,
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
