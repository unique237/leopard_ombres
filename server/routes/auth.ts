import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../auth.js";
import { pgQuery, pgQuerySingle } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password || password.length < 6) {
    res.status(400).json({ error: "Email and password (min 6 chars) required" });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pgQuerySingle<{ id: string; email: string; error?: string }>(
      "SELECT id, email FROM admin_register_user($1, $2)",
      [email, hash]
    );

    if (!result || result.error) {
      res.status(400).json({ error: result?.error || "Registration failed" });
      return;
    }

    const token = signToken({ sub: result.id, email: result.email });
    res.json({ token, user: { email: result.email } });
  } catch (err: any) {
    console.error("[auth/register]", err);
    // If user already exists, the function throws or returns error.
    if (err.message && err.message.includes("already registered")) {
      res.status(400).json({ error: "Email already registered" });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  try {
    const user = await pgQuerySingle<{ id: string; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM admin_get_user_by_email($1)",
      [email]
    );

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ user: req.admin });
});

export default router;
