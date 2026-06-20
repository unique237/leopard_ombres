/*
# Admin Dashboard Schema

This migration creates the schema needed for an authenticated admin dashboard
where the author can manage her books catalog, edit launch-promo / contact /
payment / bank settings, view orders, and track basic site analytics.

## New Tables

1. `books`
   - `id` (uuid PK)
   - `title` (text)
   - `subtitle` (text)
   - `tagline` (text) - short marketing line
   - `author` (text)
   - `description` (text)
   - `cover_url` (text) - public URL of cover image
   - `price_promo` (integer)
   - `price_full` (integer)
   - `currency` (text)
   - `status` (text: draft | published | archived)
   - `featured` (boolean) - which book to spotlight on the landing page
   - `release_date` (date)
   - `created_at`, `updated_at` (timestamptz)

2. `site_settings`
   - `key` (text PK) - e.g. 'promo', 'contact', 'payments', 'bank'
   - `value` (jsonb) - flexible structured config
   - `updated_at` (timestamptz)

3. `page_visits`
   - `id` (uuid PK)
   - `path` (text)
   - `visitor_id` (text) - persisted in localStorage (uuid)
   - `user_agent` (text)
   - `referrer` (text)
   - `created_at` (timestamptz)

## Security

- `books`: anon can SELECT only published books; authenticated have full CRUD.
- `site_settings`: anon SELECT (so the public landing page can read live config);
  authenticated INSERT/UPDATE/DELETE.
- `page_visits`: anon INSERT (visitors track themselves); authenticated SELECT
  (admin reads stats); no UPDATE/DELETE from clients.

## Notes

1. Settings rows are seeded with sensible defaults that mirror the current
   hardcoded values in `src/lib/config.ts`, so the public landing page keeps
   working without any settings rows being touched.

2. Visitor identity is opaque: a random UUID created in the browser. We do NOT
   store any personal data — this is for "unique visitors" / "page views"
   counts only.

3. The first book ("Le Léopard et les Ombres") is seeded as a featured,
   published row.
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  tagline text,
  author text NOT NULL DEFAULT 'Koreen Mbombele',
  description text,
  cover_url text,
  price_promo integer NOT NULL DEFAULT 4900,
  price_full integer NOT NULL DEFAULT 6900,
  currency text NOT NULL DEFAULT 'FCFA',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  release_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_status_idx ON books(status);
CREATE INDEX IF NOT EXISTS books_featured_idx ON books(featured);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_books" ON books;
CREATE POLICY "anon_select_published_books" ON books FOR SELECT
  TO anon USING (status = 'published');

DROP POLICY IF EXISTS "auth_select_books" ON books;
CREATE POLICY "auth_select_books" ON books FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_books" ON books;
CREATE POLICY "auth_insert_books" ON books FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_books" ON books;
CREATE POLICY "auth_update_books" ON books FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_books" ON books;
CREATE POLICY "auth_delete_books" ON books FOR DELETE
  TO authenticated USING (true);


CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON site_settings;
CREATE POLICY "anon_select_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_settings" ON site_settings;
CREATE POLICY "auth_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON site_settings;
CREATE POLICY "auth_delete_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);


CREATE TABLE IF NOT EXISTS page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '/',
  visitor_id text,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_visits_created_idx ON page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS page_visits_visitor_idx ON page_visits(visitor_id);

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_visits" ON page_visits;
CREATE POLICY "anon_insert_visits" ON page_visits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_visits" ON page_visits;
CREATE POLICY "auth_select_visits" ON page_visits FOR SELECT
  TO authenticated USING (true);


-- Seed default settings (idempotent via ON CONFLICT)
INSERT INTO site_settings (key, value) VALUES
  ('promo', jsonb_build_object(
    'end_iso', '2026-07-31T23:59:00+01:00',
    'total_spots', 500,
    'baseline_sold', 247,
    'price_promo', 4900,
    'price_full', 6900,
    'currency', 'FCFA',
    'enabled', true
  )),
  ('contact', jsonb_build_object(
    'email', 'feminina08@gmail.com',
    'phone', '+237651645025',
    'whatsapp', '+237651645025'
  )),
  ('payments', jsonb_build_object(
    'mtn', jsonb_build_object('label', 'MTN Mobile Money', 'number', '651 645 025', 'enabled', true),
    'orange', jsonb_build_object('label', 'Orange Money', 'number', '697 693 595', 'enabled', true),
    'cinetpay', jsonb_build_object('label', 'CinetPay', 'enabled', true),
    'paypal', jsonb_build_object('label', 'PayPal / Visa / Mastercard', 'enabled', true)
  )),
  ('bank', jsonb_build_object(
    'bank_name', '',
    'account_holder', '',
    'account_number', '',
    'iban', '',
    'swift', '',
    'enabled', false
  ))
ON CONFLICT (key) DO NOTHING;


-- Seed featured book (idempotent via NOT EXISTS)
INSERT INTO books (title, subtitle, tagline, author, description, cover_url, price_promo, price_full, currency, status, featured, release_date)
SELECT
  'Le Léopard et les Ombres',
  'Tome I — Édition collector',
  'Quand le pouvoir rencontre l''occulte, l''Afrique retient son souffle.',
  'Koreen Mbombele',
  'République du Nzanda. Une nuit. Un coup d''État. Le colonel Évariste LOMBO-KANDA prend le pouvoir par les armes et promet de sauver la République. Mais derrière la façade officielle se trament d''autres alliances : pactes occultes, trahisons feutrées, dette aux ancêtres et à ceux qu''on ne nomme pas.',
  '/book-cover.webp',
  4900,
  6900,
  'FCFA',
  'published',
  true,
  '2025-11-01'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Le Léopard et les Ombres');
