import { Router } from "express";
import { restGet, restInsert } from "../db.js";

const router = Router();

const STORAGE_KEY = "lvl_visitor_id";

router.post("/", async (req, res) => {
  const { path, visitor_id, user_agent, referrer } = req.body ?? {};
  if (!visitor_id) {
    res.status(400).json({ error: "visitor_id required" });
    return;
  }
  try {
    await restInsert(
      "page_visits",
      {
        path: path || "/",
        visitor_id: String(visitor_id).slice(0, 100),
        user_agent: user_agent ? String(user_agent).slice(0, 500) : null,
        referrer: referrer ? String(referrer).slice(0, 500) : null,
      },
      { token: undefined }
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    // Non-fatal — don't break the page load
    console.error("[visits]", err);
    res.status(201).json({ ok: true });
  }
});

export default router;
