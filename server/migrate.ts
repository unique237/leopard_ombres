/**
 * Auto-migration runner.
 *
 * Called at server startup (before app.listen).
 * Each entry in MIGRATIONS runs exactly once, tracked in the _migrations table.
 * All SQL uses IF NOT EXISTS / ON CONFLICT so it is safe to re-run and safe
 * against an already-populated database (e.g. Render deployment).
 *
 * Supabase-specific constructs (RLS roles anon/authenticated, storage.objects,
 * SECURITY DEFINER grants) are intentionally omitted — the Express server
 * connects as the DB owner and handles its own auth.
 */

import { pool } from "./db.js";

interface Migration {
  id: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  // ─── 001 ─ orders table ────────────────────────────────────────────────────
  {
    id: "001_orders",
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        format            text        NOT NULL CHECK (format IN ('physical','digital')),
        email             text        NOT NULL,
        first_name        text        NOT NULL,
        phone             text,
        city              text,
        address           text,
        delivery_method   text        CHECK (delivery_method IN ('home','pickup')),
        payment_method    text        NOT NULL CHECK (payment_method IN ('mtn','orange','cinetpay','paypal')),
        payment_proof_url text,
        amount            integer     NOT NULL DEFAULT 4900,
        status            text        NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending','verifying','confirmed','delivered')),
        created_at        timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    `,
  },

  // ─── 002 ─ books · site_settings · page_visits + seed data ────────────────
  {
    id: "002_books_settings_visits",
    sql: `
      CREATE TABLE IF NOT EXISTS books (
        id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        title        text        NOT NULL,
        subtitle     text,
        tagline      text,
        author       text        NOT NULL DEFAULT 'Koreen Mbombele',
        description  text,
        cover_url    text,
        price_promo  integer     NOT NULL DEFAULT 4900,
        price_full   integer     NOT NULL DEFAULT 6900,
        currency     text        NOT NULL DEFAULT 'FCFA',
        status       text        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','published','archived')),
        featured     boolean     NOT NULL DEFAULT false,
        release_date date,
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS books_status_idx   ON books(status);
      CREATE INDEX IF NOT EXISTS books_featured_idx ON books(featured);

      CREATE TABLE IF NOT EXISTS site_settings (
        key        text        PRIMARY KEY,
        value      jsonb       NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS page_visits (
        id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        path       text        NOT NULL DEFAULT '/',
        visitor_id text,
        user_agent text,
        referrer   text,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS page_visits_created_idx ON page_visits(created_at DESC);
      CREATE INDEX IF NOT EXISTS page_visits_visitor_idx ON page_visits(visitor_id);

      -- Seed default site settings (idempotent)
      INSERT INTO site_settings (key, value) VALUES
        ('promo', '{
          "end_iso":       "2026-07-31T23:59:00+01:00",
          "total_spots":   500,
          "baseline_sold": 247,
          "price_promo":   4900,
          "price_full":    6900,
          "currency":      "FCFA",
          "enabled":       true
        }'::jsonb),
        ('contact', '{
          "email":    "feminina08@gmail.com",
          "phone":    "+237651645025",
          "whatsapp": "+237651645025"
        }'::jsonb),
        ('payments', '{
          "mtn":      {"label":"MTN Mobile Money",          "number":"651 645 025", "enabled":true},
          "orange":   {"label":"Orange Money",              "number":"697 693 595", "enabled":true},
          "cinetpay": {"label":"CinetPay",                                          "enabled":true},
          "paypal":   {"label":"PayPal / Visa / Mastercard",                        "enabled":true}
        }'::jsonb),
        ('bank', '{
          "bank_name":      "",
          "account_holder": "",
          "account_number": "",
          "iban":           "",
          "swift":          "",
          "enabled":        false
        }'::jsonb)
      ON CONFLICT (key) DO NOTHING;

      -- Seed featured book (idempotent)
      INSERT INTO books (
        title, subtitle, tagline, author, description,
        cover_url, price_promo, price_full, currency, status, featured, release_date
      )
      SELECT
        'Le Léopard et les Ombres',
        'Tome I — Édition collector',
        'Quand le pouvoir rencontre l''occulte, l''Afrique retient son souffle.',
        'Koreen Mbombele',
        'République du Nzanda. Une nuit. Un coup d''État. Le colonel Évariste LOMBO-KANDA '
        'prend le pouvoir par les armes et promet de sauver la République. Mais derrière '
        'la façade officielle se trament d''autres alliances : pactes occultes, trahisons '
        'feutrées, dette aux ancêtres et à ceux qu''on ne nomme pas.',
        '/book-cover.jpeg',
        4900, 6900, 'FCFA', 'published', true, '2025-11-01'
      WHERE NOT EXISTS (
        SELECT 1 FROM books WHERE title = 'Le Léopard et les Ombres'
      );
    `,
  },

  // ─── 003 ─ order_stats counter table + trigger ────────────────────────────
  {
    id: "003_order_stats",
    sql: `
      CREATE TABLE IF NOT EXISTS order_stats (
        id           integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        total_orders integer NOT NULL DEFAULT 0
      );

      INSERT INTO order_stats (id, total_orders) VALUES (1, 0)
      ON CONFLICT (id) DO NOTHING;

      CREATE OR REPLACE FUNCTION increment_order_stats()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        UPDATE order_stats SET total_orders = total_orders + 1 WHERE id = 1;
        RETURN NEW;
      END;
      $$;

      DROP TRIGGER IF EXISTS trg_increment_order_stats ON orders;

      CREATE TRIGGER trg_increment_order_stats
        AFTER INSERT ON orders
        FOR EACH ROW
        EXECUTE FUNCTION increment_order_stats();

      -- Sync counter with actual row count (safe on first run and re-runs)
      UPDATE order_stats
      SET total_orders = (SELECT COUNT(*) FROM orders)
      WHERE id = 1;
    `,
  },

  // ─── 004 ─ comments · admin_users · auth helper functions ─────────────────
  {
    id: "004_comments_admin_auth",
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        author_name text        NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 100),
        comment     text        NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 2000),
        is_published boolean    NOT NULL DEFAULT false,
        created_at  timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS comments_published_idx
        ON comments (is_published, created_at DESC);

      CREATE TABLE IF NOT EXISTS admin_users (
        id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        email         text        UNIQUE NOT NULL,
        password_hash text        NOT NULL,
        created_at    timestamptz DEFAULT now()
      );

      -- Lookup helper used by POST /api/auth/login
      CREATE OR REPLACE FUNCTION admin_get_user_by_email(p_email text)
      RETURNS TABLE(id uuid, email text, password_hash text)
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
          SELECT au.id, au.email, au.password_hash
          FROM admin_users au
          WHERE au.email = p_email;
      END;
      $$;

      -- Registration helper used by POST /api/auth/register
      -- Only allows a single admin account to be created.
      CREATE OR REPLACE FUNCTION admin_register_user(p_email text, p_hash text)
      RETURNS json
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_count int;
        v_id    uuid;
      BEGIN
        SELECT COUNT(*) INTO v_count FROM admin_users;
        IF v_count > 0 THEN
          RETURN json_build_object(
            'error', 'An admin account already exists. Contact support.'
          );
        END IF;
        INSERT INTO admin_users (email, password_hash)
          VALUES (p_email, p_hash)
          RETURNING id INTO v_id;
        RETURN json_build_object('id', v_id::text, 'email', p_email);
      END;
      $$;
    `,
  },
];

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    // Tracking table — records which migrations have already run
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id     text        PRIMARY KEY,
        ran_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const migration of MIGRATIONS) {
      const { rows } = await client.query(
        "SELECT 1 FROM _migrations WHERE id = $1",
        [migration.id]
      );
      if (rows.length > 0) continue; // already applied

      console.log(`[migrate] ▶ ${migration.id}`);
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          "INSERT INTO _migrations (id) VALUES ($1)",
          [migration.id]
        );
        await client.query("COMMIT");
        console.log(`[migrate] ✓ ${migration.id}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log("[migrate] Database is up to date.");
  } finally {
    client.release();
  }
}
