/**
 * Database abstraction layer.
 *
 * Uses pg (direct PostgreSQL connection).
 */

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("[db] ERROR: No DATABASE_URL configured in environment");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log("[db] Using direct PostgreSQL connection");

export async function pgQuery<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function pgQuerySingle<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await pgQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
