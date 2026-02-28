import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ContentBlock } from "@/components/cms/CmsBlockRenderer";

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  template: string | null;
  content: ContentBlock[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
}

/**
 * Fetches a published page from Supabase by slug.
 * Uses the anon key – RLS allows public read of published pages.
 */
export function useCmsPublicPage(slug: string) {
  return useQuery({
    queryKey: ["cms-public-page", slug],
    queryFn: async (): Promise<PublicPage | null> => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, template, content, meta_title, meta_description, meta_keywords, og_image")
        .eq("slug", slug)
        .eq("status", "published" as any)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        content: Array.isArray(data.content) ? (data.content as unknown as ContentBlock[]) : [],
      } as PublicPage;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });
}
