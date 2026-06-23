import { Router } from "express";
import { pgQuery } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: read settings (promo, contact, etc.) ──────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const rows = await pgQuery<{ key: string; value: unknown }>(`SELECT key, value FROM site_settings`);
    res.json(rows);
  } catch (err) {
    console.error("[settings/list]", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// ── Admin: update specific setting ────────────────────────────────────────────
router.put("/:key", requireAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body ?? {};

  if (!value) {
    res.status(400).json({ error: "value is required" });
    return;
  }

  try {
    const now = new Date().toISOString();
    await pgQuery(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, $3) 
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3`,
      [key, JSON.stringify(value), now]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(`[settings/update] ${key}`, err);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
