import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../auth.js";
import { restRpc, supabaseSignIn, supabaseSignUp, setAdminSession } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password || password.length < 6) {
    res.status(400).json({ error: "Email and password (min 6 chars) required" });
    return;
  }

  try {
    // Try to register in Supabase Auth first (for DB access via JWT)
    const supaResult = await supabaseSignUp(email, password);
    if (supaResult.error && !supaResult.error.includes("already registered")) {
      // Also try local admin_users table as fallback
    }

    // Register in local admin_users via SECURITY DEFINER RPC
    const hash = await bcrypt.hash(password, 10);
    const result = await restRpc<{ error?: string; id?: string; email?: string }>(
      "admin_register_user",
      { p_email: email, p_hash: hash }
    );

    if (result?.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    const token = signToken({ sub: result.id ?? email, email });
    res.json({ token, user: { email } });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  try {
    // 1. Verify against local admin_users table
    const users = await restRpc<Array<{ id: string; email: string; password_hash: string }>>(
      "admin_get_user_by_email",
      { p_email: email }
    );

    const user = Array.isArray(users) ? users[0] : null;

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // 2. Also sign into Supabase Auth so the backend can make authenticated DB calls
    try {
      const supaResult = await supabaseSignIn(email, password);
      if ("access_token" in supaResult) {
        setAdminSession(supaResult.access_token, supaResult.refresh_token, supaResult.expires_in);
      }
    } catch {
      // Non-fatal: DB operations will fall back to anon key
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
