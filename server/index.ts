import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import booksRouter from "./routes/books.js";
import commentsRouter from "./routes/comments.js";
import settingsRouter from "./routes/settings.js";
import statsRouter from "./routes/stats.js";
import visitsRouter from "./routes/visits.js";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/books", booksRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/admin/stats", statsRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/upload", uploadRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Serve Vite build in production ────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  app.use(express.static(DIST_DIR));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[server error]", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`\n✓ API server running at http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api/health\n`);
});
