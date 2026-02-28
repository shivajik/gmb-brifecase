
-- Create role enum
CREATE TYPE public.cms_role AS ENUM ('admin', 'editor', 'viewer');

-- Create page status enum
CREATE TYPE public.page_status AS ENUM ('draft', 'published');

-- Create menu location enum
CREATE TYPE public.menu_location AS ENUM ('header', 'footer', 'sidebar');

-- CMS Users table (custom auth, no dependency on auth.users)
CREATE TABLE public.cms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS Sessions table
CREATE TABLE public.cms_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.cms_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS User Roles table (separate from users as required)
CREATE TABLE public.cms_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.cms_users(id) ON DELETE CASCADE,
  role cms_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  status page_status NOT NULL DEFAULT 'draft',
  template TEXT DEFAULT 'default',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image TEXT,
  author_id UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Menus table
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location menu_location NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu Items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target TEXT DEFAULT '_self',
  css_class TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site Settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  "group" TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Widgets table
CREATE TABLE public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  mime_type TEXT,
  size INTEGER,
  uploaded_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Security definer function to validate CMS session token
CREATE OR REPLACE FUNCTION public.validate_cms_session(session_token TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.cms_sessions
  WHERE token = session_token
    AND expires_at > now()
  LIMIT 1;
$$;

-- Security definer function to check CMS role
CREATE OR REPLACE FUNCTION public.has_cms_role(_user_id UUID, _role cms_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cms_user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS policies: service_role bypasses RLS, so edge functions using service role key can access everything.
-- For anon access, allow reading published pages, menus, menu_items, site_settings, and active widgets (public frontend).

-- Public read for published pages
CREATE POLICY "Public can read published pages" ON public.pages
  FOR SELECT TO anon USING (status = 'published');

-- Public read for menus
CREATE POLICY "Public can read menus" ON public.menus
  FOR SELECT TO anon USING (true);

-- Public read for menu items
CREATE POLICY "Public can read menu items" ON public.menu_items
  FOR SELECT TO anon USING (true);

-- Public read for site settings
CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT TO anon USING (true);

-- Public read for active widgets
CREATE POLICY "Public can read active widgets" ON public.widgets
  FOR SELECT TO anon USING (active = true);

-- Public read for media
CREATE POLICY "Public can read media" ON public.media
  FOR SELECT TO anon USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_cms_users_updated_at BEFORE UPDATE ON public.cms_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON public.widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
