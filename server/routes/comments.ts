import { Router } from "express";
import { pgQuery, pgQuerySingle } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: list published comments ───────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const comments = await pgQuery(`SELECT * FROM comments WHERE is_published = true ORDER BY created_at DESC`);
    res.json(comments);
  } catch (err) {
    console.error("[comments/public/list]", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

// ── Admin: list all comments ──────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const comments = await pgQuery(`SELECT * FROM comments ORDER BY created_at DESC`);
    res.json(comments);
  } catch (err) {
    console.error("[comments/admin/list]", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

// ── Admin: create comment ─────────────────────────────────────────────────────
router.post("/admin", requireAdmin, async (req, res) => {
  const { author_name, comment, is_published } = req.body ?? {};

  if (!author_name || !comment) {
    res.status(400).json({ error: "author_name and comment are required" });
    return;
  }

  try {
    const row = await pgQuerySingle(
      `INSERT INTO comments (author_name, comment, is_published) VALUES ($1, $2, $3) RETURNING *`,
      [author_name, comment, is_published ?? false]
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
  const update = req.body ?? {};

  if (Object.keys(update).length === 0) return res.json({ ok: true });

  try {
    const setClause = Object.keys(update)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ");
    
    const values = Object.values(update);
    values.push(id);

    await pgQuery(`UPDATE comments SET ${setClause} WHERE id = $${values.length}`, values);
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
    await pgQuery(`DELETE FROM comments WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[comments/admin/delete]", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
