import { Router } from "express";
import { restGet, restInsert } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: get all settings ──────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const rows = await restGet("site_settings", { select: "key,value", token: undefined });
    res.json(rows);
  } catch (err) {
    console.error("[settings/get]", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ── Admin: upsert a setting ───────────────────────────────────────────────────
router.put("/:key", requireAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body ?? {};
  if (value === undefined) {
    res.status(400).json({ error: "value required" });
    return;
  }

  const ALLOWED_KEYS = ["promo", "contact", "payments", "bank"];
  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({ error: "Unknown settings key" });
    return;
  }

  try {
    // Upsert via insert with on conflict — PostgREST supports this with Prefer header
    const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    const { getAdminToken } = await import("../db.js");

    // We import getAdminToken indirectly via restInsert — re-use its token
    await restInsert(
      "site_settings",
      { key, value, updated_at: new Date().toISOString() },
      { returning: false }
    );
    res.json({ ok: true });
  } catch (err) {
    // Try PATCH if insert fails (record exists)
    try {
      const { restUpdate } = await import("../db.js");
      await restUpdate("site_settings", `key=eq.${key}`, { value, updated_at: new Date().toISOString() });
      res.json({ ok: true });
    } catch (err2) {
      console.error("[settings/upsert]", err2);
      res.status(500).json({ error: "Failed to save settings" });
    }
  }
});

export default router;
