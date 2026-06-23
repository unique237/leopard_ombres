import { Router } from "express";
import { pgQuery } from "../db.js";

const router = Router();

// ── Public: track page visit ──────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { path, visitor_id, user_agent, referrer } = req.body ?? {};

  if (!visitor_id) {
    res.status(400).json({ error: "visitor_id required" });
    return;
  }

  try {
    await pgQuery(
      `INSERT INTO page_visits (path, visitor_id, user_agent, referrer) VALUES ($1, $2, $3, $4)`,
      [
        String(path ?? "/").slice(0, 500),
        String(visitor_id).slice(0, 100),
        user_agent ? String(user_agent).slice(0, 500) : null,
        referrer ? String(referrer).slice(0, 500) : null,
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("[visits/track]", err);
    res.status(500).json({ error: "Failed to track visit" });
  }
});

export default router;
