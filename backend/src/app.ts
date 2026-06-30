import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { eventRoutes } from "./modules/events/events.routes";
import { participantRoutes } from "./modules/participants/participants.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, data: { name: "Volunteer Yatra API", version: "1.0.0", health: "/api/health" } });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", uploadRoutes);

app.use("/api/events/:eventId", participantRoutes);

app.use(errorHandler);

export { app };
