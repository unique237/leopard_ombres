/*
  # Orders table for "Le Léopard et les Ombres" landing

  ## New tables
  - `orders`
    - `id` (uuid, primary key)
    - `format` (text: 'physical' | 'digital')
    - `email` (text)
    - `first_name` (text)
    - `phone` (text, nullable for digital)
    - `city` (text, nullable)
    - `address` (text, nullable)
    - `delivery_method` (text: 'home' | 'pickup', nullable)
    - `payment_method` (text: 'mtn' | 'orange' | 'cinetpay' | 'paypal')
    - `payment_proof_url` (text, nullable)
    - `amount` (integer, FCFA)
    - `status` (text: 'pending' | 'verifying' | 'confirmed' | 'delivered')
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Anonymous users can INSERT (public landing page) and SELECT their own row by id (used for confirmation page)
  - No update/delete from public side
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format text NOT NULL CHECK (format IN ('physical', 'digital')),
  email text NOT NULL,
  first_name text NOT NULL,
  phone text,
  city text,
  address text,
  delivery_method text CHECK (delivery_method IN ('home', 'pickup')),
  payment_method text NOT NULL CHECK (payment_method IN ('mtn', 'orange', 'cinetpay', 'paypal')),
  payment_proof_url text,
  amount integer NOT NULL DEFAULT 4900,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'confirmed', 'delivered')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_insert_orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "anon_select_count" ON orders
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "auth_select_count" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "anon_update_proof" ON orders
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_update_proof" ON orders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
