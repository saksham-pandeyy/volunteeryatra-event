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
  category: z.string().optional(),
  max_participants: z.number().int().positive().optional(),
  registration_deadline: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  cover_image_url: z.string().optional(),
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
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await findAllEvents(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
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
    const from = parseQuery(req.query.from);
    const to = parseQuery(req.query.to);
    const data = await getDashboardStats(from, to);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function exportCsv(
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
      limit: 99999,
    };
    const { data: events } = await findAllEvents(filters);
    
    const headers = ["Name","Description","Date","Location","Status","Category","Max Participants","Created At"];
    const rows = events.map((e) => [
      `"${(e.name || "").replace(/"/g, '""')}"`,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.date,
      `"${(e.location || "").replace(/"/g, '""')}"`,
      e.status,
      e.category,
      e.max_participants?.toString() || "",
      e.created_at,
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="events-export-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}
