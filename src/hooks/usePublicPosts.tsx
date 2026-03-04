import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string | null; email: string } | null;
  tags: { id: string; name: string; slug: string }[];
}

export interface PublicPostFull extends PublicPost {
  content: unknown[];
  editor_mode: "simple" | "builder";
  meta_title: string | null;
  meta_description: string | null;
}

async function invokePublic(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("cms-posts", {
    body: { action, ...body },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function usePublicPosts(categoryId?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["public-posts", categoryId, limit, offset],
    queryFn: async () => {
      const res = await invokePublic("public_list", {
        category_id: categoryId || undefined,
        limit,
        offset,
      });
      return {
        posts: res.posts as PublicPost[],
        categories: res.categories as { id: string; name: string; slug: string }[],
      };
    },
    staleTime: 60_000,
  });
}

export function usePublicPost(slug?: string) {
  return useQuery({
    queryKey: ["public-post", slug],
    queryFn: async () => {
      const res = await invokePublic("public_get", { slug });
      return res.post as PublicPostFull;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}
