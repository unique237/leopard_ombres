import { Router } from "express";
import { pgQuery } from "../db.js";
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
    const orderId = id || crypto.randomUUID();
    
    await pgQuery(
      `INSERT INTO orders (
        id, format, first_name, email, phone, city, address, 
        delivery_method, payment_method, payment_proof_url, amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        orderId,
        format,
        String(first_name).slice(0, 100),
        String(email).slice(0, 200),
        phone ?? null,
        city ?? null,
        address ?? null,
        delivery_method ?? null,
        payment_method,
        null,
        Number(amount),
        "pending"
      ]
    );

    console.log(`[orders] Created order ${orderId} for ${email}`);
    res.status(201).json({ id: orderId });
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
    await pgQuery(
      `UPDATE orders SET payment_proof_url = $1, status = 'verifying' WHERE id = $2 AND status = 'pending'`,
      [payment_proof_url, id]
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
    const orders = await pgQuery(`SELECT * FROM orders ORDER BY created_at DESC`);
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
    await pgQuery(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[orders/admin/status]", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
