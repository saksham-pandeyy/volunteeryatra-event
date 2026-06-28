import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { register, login, me, forgotPassword, resetPassword } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export { router as authRoutes };
