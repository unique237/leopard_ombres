import { Router } from "express";
import { restGet, restInsert, restUpdate } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Public: create new order ──────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const {
    id, format, first_name, email, phone, city, address,
    delivery_method, payment_method, amount, status,
  } = req.body ?? {};

  if (!format || !first_name || !email || !payment_method || !amount) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!["physical", "digital"].includes(format)) {
    res.status(400).json({ error: "Invalid format" });
    return;
  }
  if (amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  try {
    const row = {
      id: id || crypto.randomUUID(),
      format,
      first_name: String(first_name).slice(0, 100),
      email: String(email).slice(0, 200),
      phone: phone ?? null,
      city: city ?? null,
      address: address ?? null,
      delivery_method: delivery_method ?? null,
      payment_method,
      payment_proof_url: null,
      amount: Number(amount),
      status: "pending",
    };

    await restInsert("orders", row, { token: undefined }); // anon key — INSERT policy allows it

    console.log(`[orders] Created order ${row.id} for ${email}`);
    res.status(201).json({ id: row.id });
  } catch (err) {
    console.error("[orders/create]", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ── Public: attach payment proof ──────────────────────────────────────────────
router.patch("/:id/proof", async (req, res) => {
  const { id } = req.params;
  const { payment_proof_url } = req.body ?? {};

  if (!payment_proof_url) {
    res.status(400).json({ error: "payment_proof_url required" });
    return;
  }

  try {
    await restUpdate(
      "orders",
      `id=eq.${id}&status=eq.pending`,
      { payment_proof_url, status: "verifying" },
      { token: undefined }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[orders/proof]", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ── Admin: list all orders ────────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const orders = await restGet("orders", { order: "created_at.desc" });
    res.json(orders);
  } catch (err) {
    console.error("[orders/admin/list]", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ── Admin: update order status ────────────────────────────────────────────────
router.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  const validStatuses = ["pending", "verifying", "confirmed", "delivered"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    await restUpdate("orders", `id=eq.${id}`, { status });
    res.json({ ok: true });
  } catch (err) {
    console.error("[orders/admin/status]", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
