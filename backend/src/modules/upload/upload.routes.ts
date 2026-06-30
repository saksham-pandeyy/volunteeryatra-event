import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../../middleware/authenticate";
import { environment } from "../../config/environment";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabaseAdmin = createClient(
  environment.supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY || environment.supabaseAnonKey
);

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      const file = req.file;
      const bucket = (req.query.bucket as string) || "covers";
      const ext = file.originalname.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        res.status(500).json({ success: false, error: `Upload failed: ${error.message}` });
        return;
      }

      // Return only the relative path — frontend constructs the public URL
      res.json({ success: true, data: { path: `${bucket}/${fileName}` } });
    } catch (err) {
      next(err);
    }
  }
);

export { router as uploadRoutes };
