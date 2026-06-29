import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { z } from "zod";
import { apply, list, cancel } from "./participants.controller";

const applySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const cancelSchema = z.object({
  reason: z.string().min(1),
});

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/apply", validate(applySchema), apply);
router.get("/participants", list);
router.delete("/participants/:participantId", validate(cancelSchema), cancel);

export { router as participantRoutes };
