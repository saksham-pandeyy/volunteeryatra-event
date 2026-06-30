import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { register, login, me, forgotPassword, resetPassword, updateProfile } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile", authenticate, updateProfile);

export { router as authRoutes };
