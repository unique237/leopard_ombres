/*
# Fix Orders RLS + Create Comments Table

## Changes

### 1. Orders table policy fixes
- Add SELECT policy for authenticated (admin can view all orders)
- Add unrestricted UPDATE policy for authenticated (admin can change any status)
- Relax INSERT amount constraint from hardcoded [4900, 6900] to any positive value
  (the old constraint broke when admin changes the price in settings)

### 2. New `comments` table
- Stores reader testimonials/simulated Facebook comments
- Fields: id, author_name, comment, created_at, is_published
- RLS: anon can SELECT published only; authenticated has full CRUD

### 3. Admin auth helper functions (SECURITY DEFINER)
- Functions to manage admin_users bypassing RLS
- Called from Express backend only, not from browser
*/

-- ─── Orders: add missing SELECT policy ────────────────────────────────────────
DROP POLICY IF EXISTS "auth_select_orders" ON orders;
CREATE POLICY "auth_select_orders" ON orders FOR SELECT
TO authenticated USING (true);

-- ─── Orders: full UPDATE for admin ────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_admin_update_order" ON orders;
CREATE POLICY "auth_admin_update_order" ON orders FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- ─── Orders: relax amount constraint (was hardcoded 4900/6900) ─────────────────
DROP POLICY IF EXISTS "anon_insert_pending_orders" ON orders;
CREATE POLICY "anon_insert_pending_orders" ON orders FOR INSERT
TO anon WITH CHECK (
  status = 'pending'
  AND payment_proof_url IS NULL
  AND amount > 0
  AND char_length(email) BETWEEN 5 AND 200
  AND char_length(first_name) BETWEEN 1 AND 100
);

DROP POLICY IF EXISTS "auth_insert_pending_orders" ON orders;
CREATE POLICY "auth_insert_pending_orders" ON orders FOR INSERT
TO authenticated WITH CHECK (
  status = 'pending'
  AND payment_proof_url IS NULL
  AND amount > 0
  AND char_length(email) BETWEEN 5 AND 200
  AND char_length(first_name) BETWEEN 1 AND 100
);

-- ─── Comments table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 100),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 2000),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_comments" ON comments;
CREATE POLICY "anon_select_published_comments" ON comments FOR SELECT
TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "auth_select_all_comments" ON comments;
CREATE POLICY "auth_select_all_comments" ON comments FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_comments" ON comments;
CREATE POLICY "auth_insert_comments" ON comments FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_comments" ON comments;
CREATE POLICY "auth_update_comments" ON comments FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_comments" ON comments;
CREATE POLICY "auth_delete_comments" ON comments FOR DELETE
TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS comments_published_idx ON comments (is_published, created_at DESC);

-- ─── Admin users table (for Express JWT auth, independent of Supabase Auth) ────
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Table locked down — accessed only via SECURITY DEFINER functions below
DROP POLICY IF EXISTS "no_direct_access" ON admin_users;
CREATE POLICY "no_direct_access" ON admin_users FOR SELECT TO anon USING (false);
DROP POLICY IF EXISTS "no_direct_access_auth" ON admin_users;
CREATE POLICY "no_direct_access_auth" ON admin_users FOR SELECT TO authenticated USING (false);

-- ─── SECURITY DEFINER helpers for admin auth ──────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_user_by_email(p_email text)
RETURNS TABLE(id uuid, email text, password_hash text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT au.id, au.email, au.password_hash
  FROM admin_users au WHERE au.email = p_email;
END;
$$;

CREATE OR REPLACE FUNCTION admin_register_user(p_email text, p_hash text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count int;
  v_id uuid;
BEGIN
  SELECT COUNT(*) INTO v_count FROM admin_users;
  IF v_count > 0 THEN
    RETURN json_build_object('error', 'An admin account already exists. Contact support.');
  END IF;
  INSERT INTO admin_users (email, password_hash) VALUES (p_email, p_hash) RETURNING id INTO v_id;
  RETURN json_build_object('id', v_id::text, 'email', p_email);
END;
$$;
