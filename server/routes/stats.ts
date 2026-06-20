import { Router } from "express";
import { restGet, restCount } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const since24 = new Date(Date.now() - 86400_000).toISOString();

    // Fetch data in parallel
    const [visits30, orders, books] = await Promise.all([
      restGet<{ visitor_id: string; created_at: string }>("page_visits", {
        select: "visitor_id,created_at",
        filters: `created_at=gte.${since30}`,
        order: "created_at.asc",
      }),
      restGet<{
        id: string;
        amount: number;
        status: string;
        created_at: string;
      }>("orders", { order: "created_at.desc" }),
      restGet<{ status: string }>("books", { select: "status" }),
    ]);

    const visits24 = visits30.filter((v) => v.created_at >= since24).length;
    const uniqueVisitors = new Set(visits30.map((v) => v.visitor_id)).size;

    const ordersPending = orders.filter((o) => o.status === "pending" || o.status === "verifying").length;
    const revenueConfirmed = orders
      .filter((o) => o.status === "confirmed" || o.status === "delivered")
      .reduce((s, o) => s + Number(o.amount), 0);
    const revenuePending = orders
      .filter((o) => o.status === "pending" || o.status === "verifying")
      .reduce((s, o) => s + Number(o.amount), 0);

    // Daily chart — last 14 days
    const daily: { day: string; visits: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000);
      const day = d.toISOString().slice(0, 10);
      daily.push({
        day,
        visits: visits30.filter((v) => v.created_at.slice(0, 10) === day).length,
        orders: orders.filter((o) => o.created_at.slice(0, 10) === day).length,
      });
    }

    res.json({
      visits_total: visits30.length,
      visits_unique: uniqueVisitors,
      visits_24h: visits24,
      orders_total: orders.length,
      orders_pending: ordersPending,
      revenue_confirmed: revenueConfirmed,
      revenue_pending: revenuePending,
      books_published: books.filter((b) => b.status === "published").length,
      books_total: books.length,
      recent_orders: orders.slice(0, 6),
      daily,
    });
  } catch (err) {
    console.error("[stats]", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;
