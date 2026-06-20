import { Router } from "express";
import { restGet, restInsert, restUpdate, restDelete } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: published books ───────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const books = await restGet("books", {
      filters: "status=eq.published",
      order: "featured.desc,updated_at.desc",
      token: undefined,
    });
    res.json(books);
  } catch (err) {
    console.error("[books/public]", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// ── Admin: all books ──────────────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const books = await restGet("books", { order: "featured.desc,updated_at.desc" });
    res.json(books);
  } catch (err) {
    console.error("[books/admin/list]", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// ── Admin: create book ────────────────────────────────────────────────────────
router.post("/admin", requireAdmin, async (req, res) => {
  const data = req.body ?? {};
  if (!data.title || !data.author) {
    res.status(400).json({ error: "Title and author required" });
    return;
  }
  try {
    const now = new Date().toISOString();
    const book = await restInsert("books", { ...data, created_at: now, updated_at: now }, { returning: true });
    res.status(201).json(book);
  } catch (err) {
    console.error("[books/admin/create]", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// ── Admin: update book ────────────────────────────────────────────────────────
router.put("/admin/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body, updated_at: new Date().toISOString() };
  delete data.id;
  delete data.created_at;

  try {
    await restUpdate("books", `id=eq.${id}`, data);
    res.json({ ok: true });
  } catch (err) {
    console.error("[books/admin/update]", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// ── Admin: delete book ────────────────────────────────────────────────────────
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await restDelete("books", `id=eq.${id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[books/admin/delete]", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
