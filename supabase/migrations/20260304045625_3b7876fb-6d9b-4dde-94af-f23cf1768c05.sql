
-- ─── Blog Categories ─────────────────────────────────────────────────
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories"
  ON public.categories FOR SELECT
  USING (true);

-- ─── Blog Tags ───────────────────────────────────────────────────────
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read tags"
  ON public.tags FOR SELECT
  USING (true);

-- ─── Blog Posts ──────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content jsonb DEFAULT '[]'::jsonb,
  featured_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  editor_mode text NOT NULL DEFAULT 'simple' CHECK (editor_mode IN ('simple', 'builder')),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.cms_users(id) ON DELETE SET NULL,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

-- ─── Post-Tags junction ─────────────────────────────────────────────
CREATE TABLE public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read post_tags"
  ON public.post_tags FOR SELECT
  USING (true);

-- ─── Updated_at trigger for posts ────────────────────────────────────
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ─── Storage bucket for blog images ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Allow public read on blog-images bucket
CREATE POLICY "Allow public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated uploads (via service role in edge functions)
CREATE POLICY "Allow service uploads blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow service delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images');
