/*
  # Replace SECURITY DEFINER RPC with a trigger-maintained counter

  ## Why
  public_order_count() is SECURITY DEFINER, giving it elevated privileges.
  Even though it only returns an integer, the scanner correctly flags any
  SECURITY DEFINER callable by anon/authenticated as a risk.

  ## Replacement design
  - New table `order_stats` holds a single row with the running total.
  - A SECURITY INVOKER trigger function increments it on each INSERT to orders.
  - anon/authenticated get a narrow SELECT policy on order_stats only.
  - The old SECURITY DEFINER function is dropped.
  - No SECURITY DEFINER code remains on the public schema.
*/

DROP FUNCTION IF EXISTS public.public_order_count();

CREATE TABLE IF NOT EXISTS order_stats (
  id   integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_orders integer NOT NULL DEFAULT 0
);

INSERT INTO order_stats (id, total_orders) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE order_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_order_stats" ON order_stats
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "auth_read_order_stats" ON order_stats
  FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION increment_order_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

UPDATE order_stats
SET total_orders = (SELECT COUNT(*) FROM orders)
WHERE id = 1;
