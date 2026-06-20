import { Router } from "express";
import { restGet, restInsert, restUpdate, restDelete } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: published comments ────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const comments = await restGet("comments", {
      filters: "is_published=eq.true",
      order: "created_at.desc",
      token: undefined,
    });
    res.json(comments);
  } catch (err) {
    console.error("[comments/public]", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ── Admin: all comments ───────────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const comments = await restGet("comments", { order: "created_at.desc" });
    res.json(comments);
  } catch (err) {
    console.error("[comments/admin/list]", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ── Admin: create comment ─────────────────────────────────────────────────────
router.post("/admin", requireAdmin, async (req, res) => {
  const { author_name, comment, is_published, created_at } = req.body ?? {};
  if (!author_name || !comment) {
    res.status(400).json({ error: "author_name and comment required" });
    return;
  }
  try {
    const row = await restInsert(
      "comments",
      {
        author_name: String(author_name).slice(0, 100),
        comment: String(comment).slice(0, 2000),
        is_published: Boolean(is_published),
        created_at: created_at || new Date().toISOString(),
      },
      { returning: true }
    );
    res.status(201).json(row);
  } catch (err) {
    console.error("[comments/admin/create]", err);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// ── Admin: update comment ─────────────────────────────────────────────────────
router.put("/admin/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { author_name, comment, is_published, created_at } = req.body ?? {};
  const update: Record<string, unknown> = {};
  if (author_name !== undefined) update.author_name = String(author_name).slice(0, 100);
  if (comment !== undefined) update.comment = String(comment).slice(0, 2000);
  if (is_published !== undefined) update.is_published = Boolean(is_published);
  if (created_at !== undefined) update.created_at = created_at;

  try {
    await restUpdate("comments", `id=eq.${id}`, update);
    res.json({ ok: true });
  } catch (err) {
    console.error("[comments/admin/update]", err);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// ── Admin: delete comment ─────────────────────────────────────────────────────
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await restDelete("comments", `id=eq.${id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[comments/admin/delete]", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
