import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CmsBlockRenderer } from "@/components/cms/CmsBlockRenderer";
import { useCmsPublicPage } from "@/hooks/useCmsPublicPage";

interface CmsPageWrapperProps {
  slug: string;
  /** Hardcoded fallback rendered while CMS loads or if CMS has no data */
  fallback: React.ReactNode;
}

/**
 * Wraps a page with CMS integration:
 * - Fetches the CMS page by slug
 * - If CMS has content, renders it dynamically via CmsBlockRenderer
 * - Otherwise renders the hardcoded fallback (preserving existing design)
 * - Sets document title and meta from CMS data
 */
export function CmsPageWrapper({ slug, fallback }: CmsPageWrapperProps) {
  const { data: page, isLoading } = useCmsPublicPage(slug);

  // Update document meta from CMS
  useEffect(() => {
    if (!page) return;

    if (page.meta_title) {
      document.title = page.meta_title;
    }

    const updateMeta = (name: string, content: string | null) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", page.meta_description);
    updateMeta("keywords", page.meta_keywords);

    // OG tags
    if (page.og_image) {
      let og = document.querySelector('meta[property="og:image"]');
      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:image");
        document.head.appendChild(og);
      }
      og.setAttribute("content", page.og_image);
    }
  }, [page]);

  // While loading, show fallback (no flash of empty content)
  if (isLoading) {
    return <Layout>{fallback}</Layout>;
  }

  // If CMS page exists and has content blocks, render dynamically
  if (page?.content?.length) {
    return (
      <Layout>
        <CmsBlockRenderer blocks={page.content} />
      </Layout>
    );
  }

  // No CMS data — use hardcoded fallback
  return <Layout>{fallback}</Layout>;
}
