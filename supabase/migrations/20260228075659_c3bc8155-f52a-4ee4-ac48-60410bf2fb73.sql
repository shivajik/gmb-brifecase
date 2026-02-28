
-- Fix: menus and menu_items have RESTRICTIVE policies but no PERMISSIVE ones,
-- so public SELECT is blocked. Drop restrictive and recreate as permissive.

DROP POLICY IF EXISTS "Allow public read menus" ON public.menus;
CREATE POLICY "Allow public read menus"
  ON public.menus FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public read menu items" ON public.menu_items;
CREATE POLICY "Allow public read menu items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (true);
