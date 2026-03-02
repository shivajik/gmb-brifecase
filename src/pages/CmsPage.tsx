import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CmsBlockRenderer } from "@/components/cms/CmsBlockRenderer";
import { useCmsPublicPage } from "@/hooks/useCmsPublicPage";

/**
 * Renders any CMS page by its slug from the URL.
 * Used as a catch-all route for dynamically created CMS pages.
 */
export default function CmsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = useCmsPublicPage(slug || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="py-24 text-center text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CmsBlockRenderer blocks={page.content || []} />
    </Layout>
  );
}
