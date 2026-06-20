/*
  # Tighten orders RLS + remove broad storage SELECT

  - Drop permissive policies (WITH CHECK (true) / USING (true)).
  - Replace INSERT with narrow check (pending + no proof + known amount).
  - Replace UPDATE with narrow check (pending->verifying transition only).
  - Remove SELECT on orders; spots count goes through SECURITY DEFINER RPC.
  - Drop broad storage SELECT (public bucket already serves URLs).
*/

DROP POLICY IF EXISTS "anon_insert_orders"  ON orders;
DROP POLICY IF EXISTS "auth_insert_orders"  ON orders;
DROP POLICY IF EXISTS "anon_update_proof"   ON orders;
DROP POLICY IF EXISTS "auth_update_proof"   ON orders;
DROP POLICY IF EXISTS "anon_select_count"   ON orders;
DROP POLICY IF EXISTS "auth_select_count"   ON orders;

CREATE POLICY "anon_insert_pending_orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (
    status = 'pending'
    AND payment_proof_url IS NULL
    AND amount IN (4900, 6900)
    AND char_length(email) BETWEEN 5 AND 200
    AND char_length(first_name) BETWEEN 1 AND 100
  );

CREATE POLICY "auth_insert_pending_orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending'
    AND payment_proof_url IS NULL
    AND amount IN (4900, 6900)
    AND char_length(email) BETWEEN 5 AND 200
    AND char_length(first_name) BETWEEN 1 AND 100
  );

CREATE POLICY "anon_attach_proof" ON orders
  FOR UPDATE TO anon
  USING (status = 'pending' AND payment_proof_url IS NULL)
  WITH CHECK (status = 'verifying' AND payment_proof_url IS NOT NULL);

CREATE POLICY "auth_attach_proof" ON orders
  FOR UPDATE TO authenticated
  USING (status = 'pending' AND payment_proof_url IS NULL)
  WITH CHECK (status = 'verifying' AND payment_proof_url IS NOT NULL);

CREATE OR REPLACE FUNCTION public.public_order_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::integer FROM orders;
$$;

REVOKE ALL ON FUNCTION public.public_order_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_order_count() TO anon, authenticated;

DROP POLICY IF EXISTS "anon_read_payment_proof" ON storage.objects;
DROP POLICY IF EXISTS "auth_read_payment_proof" ON storage.objects;
