import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pgQuery } from "../db.js";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)$/;
    cb(null, allowed.test(file.mimetype));
  },
});

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Image file required (JPEG/PNG/GIF/WebP, max 5 MB)" });
    return;
  }

  const { order_id } = req.body ?? {};
  const fileUrl = `/uploads/${req.file.filename}`;

  if (order_id) {
    try {
      await pgQuery(
        `UPDATE orders SET payment_proof_url = $1, status = 'verifying' WHERE id = $2 AND status = 'pending'`,
        [fileUrl, order_id]
      );
    } catch (err) {
      console.error("[upload] Failed to update order", err);
    }
  }

  res.json({ url: fileUrl, filename: req.file.filename });
});

export default router;
