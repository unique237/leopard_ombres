import { Router } from "express";
import { pgQuery, pgQuerySingle } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: list published books ──────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const books = await pgQuery(`SELECT * FROM books WHERE status = 'published' ORDER BY featured DESC, updated_at DESC`);
    res.json(books);
  } catch (err) {
    console.error("[books/public/list]", err);
    res.status(500).json({ error: "Failed to load books" });
  }
});

// ── Admin: list all books ─────────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const books = await pgQuery(`SELECT * FROM books ORDER BY featured DESC, updated_at DESC`);
    res.json(books);
  } catch (err) {
    console.error("[books/admin/list]", err);
    res.status(500).json({ error: "Failed to load books" });
  }
});

// ── Admin: create book ────────────────────────────────────────────────────────
router.post("/admin", requireAdmin, async (req, res) => {
  const data = req.body ?? {};
  try {
    const now = new Date().toISOString();
    const book = await pgQuerySingle(
      `INSERT INTO books (
        title, subtitle, tagline, author, description, cover_url, 
        price_promo, price_full, currency, status, featured, release_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        data.title, data.subtitle, data.tagline, data.author, data.description, data.cover_url,
        data.price_promo, data.price_full, data.currency, data.status, data.featured, data.release_date,
        now, now
      ]
    );
    res.status(201).json(book);
  } catch (err) {
    console.error("[books/admin/create]", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// ── Admin: update book ────────────────────────────────────────────────────────
router.put("/admin/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body ?? {};
  
  if (Object.keys(data).length === 0) return res.json({ ok: true });

  try {
    data.updated_at = new Date().toISOString();
    
    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ");
    
    const values = Object.values(data);
    values.push(id);
    
    await pgQuery(`UPDATE books SET ${setClause} WHERE id = $${values.length}`, values);
    
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
    await pgQuery(`DELETE FROM books WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[books/admin/delete]", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
