import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { z } from "zod";
import { list, getById, create, update, updateStatus, remove, stats, exportCsv } from "./events.controller";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  location: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["backlog", "in_progress", "completed"]).optional(),
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

const router = Router();

router.use(authenticate);

router.get("/stats", stats);
router.get("/export/csv", exportCsv);
router.get("/", list);
router.get("/:eventId", getById);
router.post("/", validate(createSchema), create);
router.put("/:eventId", validate(updateSchema), update);
router.patch("/:eventId/status", validate(statusSchema), updateStatus);
router.delete("/:eventId", remove);

export { router as eventRoutes };
