/**
 * Database abstraction layer.
 *
 * When DATABASE_URL is set: uses pg (direct PostgreSQL connection).
 * Otherwise: uses Supabase PostgREST HTTP API (the same PostgreSQL DB, accessed via REST).
 *
 * To switch to real PostgreSQL: set DATABASE_URL in .env and install your own DB.
 */

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(
  /\/$/,
  ""
);
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let pool: Pool | null = null;
if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  console.log("[db] Using direct PostgreSQL connection (DATABASE_URL)");
} else if (SUPABASE_URL) {
  console.log("[db] Using Supabase PostgREST (no DATABASE_URL set)");
} else {
  console.error("[db] ERROR: No database connection configured");
}

// ── Supabase admin session management ────────────────────────────────────────

let adminAccessToken: string | null = null;
let adminRefreshToken: string | null = null;
let tokenExpiry = 0;

export function setAdminSession(accessToken: string, refreshToken: string, expiresIn: number) {
  adminAccessToken = accessToken;
  adminRefreshToken = refreshToken;
  tokenExpiry = Date.now() + expiresIn * 1000 - 30_000;
}

export function clearAdminSession() {
  adminAccessToken = null;
  adminRefreshToken = null;
  tokenExpiry = 0;
}

async function refreshSession(): Promise<boolean> {
  if (!adminRefreshToken || !SUPABASE_URL) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: adminRefreshToken }),
    });
    if (!res.ok) return false;
    const d = await res.json();
    setAdminSession(d.access_token, d.refresh_token, d.expires_in);
    return true;
  } catch {
    return false;
  }
}

async function getAdminToken(): Promise<string> {
  if (adminAccessToken && Date.now() < tokenExpiry) return adminAccessToken;
  if (adminRefreshToken) {
    const ok = await refreshSession();
    if (ok && adminAccessToken) return adminAccessToken;
  }
  return SUPABASE_ANON_KEY; // fallback — limited access
}

// ── pg helpers (when DATABASE_URL set) ───────────────────────────────────────

export async function pgQuery<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  if (!pool) throw new Error("pg pool not initialised — set DATABASE_URL");
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

// ── PostgREST helpers ─────────────────────────────────────────────────────────

type FetchMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RestOpts {
  select?: string;
  filters?: string; // e.g. "status=eq.pending&amount=gt.0"
  order?: string;   // e.g. "created_at.desc"
  limit?: number;
  prefer?: string;
  token?: string;
  headers?: Record<string, string>;
}

export async function restGet<T = Record<string, unknown>>(
  table: string,
  opts: RestOpts = {}
): Promise<T[]> {
  const params = new URLSearchParams();
  if (opts.select) params.set("select", opts.select);
  if (opts.filters) opts.filters.split("&").forEach((f) => { const [k, v] = f.split("="); params.set(k, v); });
  if (opts.order) params.set("order", opts.order);
  if (opts.limit) params.set("limit", String(opts.limit));

  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const token = opts.token ?? (await getAdminToken());

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`restGet ${table}: ${res.status} ${err}`);
  }
  return res.json() as Promise<T[]>;
}

export async function restInsert<T = Record<string, unknown>>(
  table: string,
  data: Record<string, unknown>,
  opts: { token?: string; returning?: boolean } = {}
): Promise<T | null> {
  const token = opts.token ?? (await getAdminToken());
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: opts.returning ? "return=representation" : "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`restInsert ${table}: ${res.status} ${err}`);
  }
  if (opts.returning) {
    const rows = await res.json() as T[];
    return Array.isArray(rows) ? rows[0] : rows;
  }
  return null;
}

export async function restUpdate(
  table: string,
  filters: string,
  data: Record<string, unknown>,
  opts: { token?: string } = {}
): Promise<void> {
  const token = opts.token ?? (await getAdminToken());
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`restUpdate ${table}: ${res.status} ${err}`);
  }
}

export async function restDelete(
  table: string,
  filters: string,
  opts: { token?: string } = {}
): Promise<void> {
  const token = opts.token ?? (await getAdminToken());
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`restDelete ${table}: ${res.status} ${err}`);
  }
}

export async function restRpc<T = unknown>(
  fn: string,
  args: Record<string, unknown> = {},
  opts: { token?: string } = {}
): Promise<T> {
  const token = opts.token ?? SUPABASE_ANON_KEY; // RPC functions are SECURITY DEFINER
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`rpc ${fn}: ${res.status} ${err}`);
  }
  return res.json() as Promise<T>;
}

export async function restCount(table: string, filters = "", opts: { token?: string } = {}): Promise<number> {
  const token = opts.token ?? (await getAdminToken());
  const qs = filters ? `?${filters}` : "";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: "count=exact",
    },
  });
  const header = res.headers.get("content-range") ?? "0/0";
  return parseInt(header.split("/")[1] ?? "0", 10) || 0;
}

// ── Supabase Auth API helpers ─────────────────────────────────────────────────

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number } | { error: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error_description || data.msg || "Login failed" };
  return data;
}

export async function supabaseSignUp(
  email: string,
  password: string
): Promise<{ user?: { email: string }; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error_description || data.msg || "Signup failed" };
  if (data.error) return { error: data.error };
  return { user: { email: data.email || email } };
}
