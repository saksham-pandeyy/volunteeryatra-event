import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { z } from "zod";
import { list, getById, create, update, updateStatus, remove, stats } from "./events.controller";

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

const router = Router();

router.use(authenticate);

router.get("/stats", stats);
router.get("/", list);
router.get("/:eventId", getById);
router.post("/", validate(createSchema), create);
router.put("/:eventId", validate(updateSchema), update);
router.patch("/:eventId/status", validate(statusSchema), updateStatus);
router.delete("/:eventId", remove);

export { router as eventRoutes };
