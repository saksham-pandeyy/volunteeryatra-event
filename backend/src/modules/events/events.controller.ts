import { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import {
  findAllEvents,
  findEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getDashboardStats,
} from "./events.model";
import { NotFoundError, ForbiddenError } from "../../shared/errors";
import type { EventFilters, EventStatus } from "./events.model";

function parseQuery(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function param(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] || "";
  return "";
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  location: z.string().optional(),
});

const updateSchema = createSchema.partial();

const statusSchema = z.object({
  status: z.enum(["backlog", "in_progress", "completed"]),
});

export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: EventFilters = {
      name: parseQuery(req.query.name),
      date: parseQuery(req.query.date),
      location: parseQuery(req.query.location),
      status: parseQuery(req.query.status) as EventStatus | undefined,
      sortAsc: parseQuery(req.query.sort) !== "desc",
    };
    const events = await findAllEvents(filters);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createSchema.parse(req.body);
    const event = await createEvent({ ...body, owner_id: req.userId! });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the owner can update this event");
    }
    const body = updateSchema.parse(req.body);
    const updated = await updateEvent(eventId, body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the owner can change event status");
    }
    const { status } = statusSchema.parse(req.body);
    const updated = await updateEventStatus(eventId, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = param(req.params.eventId);
    const event = await findEventById(eventId);
    if (!event) throw new NotFoundError("Event");
    if (event.owner_id !== req.userId) {
      throw new ForbiddenError("Only the owner can delete this event");
    }
    await deleteEvent(eventId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
}

export async function stats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
