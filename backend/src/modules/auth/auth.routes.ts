import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../../middleware/authenticate";
import { register, login, me, forgotPassword, resetPassword, updateProfile, uploadAvatar, removeAvatar } from "./auth.controller";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../../uploads/avatars"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile", authenticate, updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", authenticate, removeAvatar);

export { router as authRoutes };
