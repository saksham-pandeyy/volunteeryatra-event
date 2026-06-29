import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { eventRoutes } from "./modules/events/events.routes";
import { participantRoutes } from "./modules/participants/participants.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const avatarsDir = path.join(__dirname, "../uploads/avatars");
fs.mkdirSync(avatarsDir, { recursive: true });

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Generic file upload endpoint (for event covers, etc.)
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No file uploaded" } });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Participant routes
app.use("/api/events/:eventId", participantRoutes);

app.use(errorHandler);

export { app };
