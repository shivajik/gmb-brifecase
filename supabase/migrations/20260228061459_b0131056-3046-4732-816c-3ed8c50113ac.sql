-- Fix RLS: current policies are RESTRICTIVE (Permissive: No) which blocks all access
-- Need PERMISSIVE policies to actually grant access

-- Pages: allow public to read published pages
CREATE POLICY "Allow public read published pages"
  ON public.pages FOR SELECT
  USING (status = 'published'::page_status);

-- Drop the old restrictive policy that blocks access
DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;

-- Site settings: allow public read
CREATE POLICY "Allow public read site settings"
  ON public.site_settings FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;

-- Menus: allow public read  
CREATE POLICY "Allow public read menus"
  ON public.menus FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Public can read menus" ON public.menus;

-- Menu items: allow public read
CREATE POLICY "Allow public read menu items"
  ON public.menu_items FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Public can read menu items" ON public.menu_items;

-- Widgets: allow public read active
CREATE POLICY "Allow public read active widgets"
  ON public.widgets FOR SELECT
  USING (active = true);
DROP POLICY IF EXISTS "Public can read active widgets" ON public.widgets;

-- Media: allow public read
CREATE POLICY "Allow public read media"
  ON public.media FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Public can read media" ON public.media;
