import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsAuth } from "@/contexts/CmsAuthContext";
import type { ContentBlock } from "@/hooks/useCmsPages";

export interface CmsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: ContentBlock[];
  featured_image: string | null;
  status: "draft" | "published";
  editor_mode: "simple" | "builder";
  category_id: string | null;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tag_ids?: string[];
  category?: { id: string; name: string; slug: string } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function invokePostsFn(action: string, body: Record<string, unknown>, token: string | null) {
  const { data, error } = await supabase.functions.invoke("cms-posts", {
    body: { action, ...body },
    headers: authHeaders(token),
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Posts ──────────────────────────────────────────────────────────────

export function useCmsPosts(status?: string, search?: string) {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-posts", status, search],
    queryFn: async () => {
      const res = await invokePostsFn("list", { status, search }, token);
      return res.posts as CmsPost[];
    },
    enabled: !!token,
  });
}

export function useCmsPost(id?: string) {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-post", id],
    queryFn: async () => {
      const res = await invokePostsFn("get", { id }, token);
      return res.post as CmsPost;
    },
    enabled: !!token && !!id,
  });
}

export function useCreatePost() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await invokePostsFn("create", body, token);
      return res.post as CmsPost;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-posts"] }),
  });
}

export function useUpdatePost() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await invokePostsFn("update", body, token);
      return res.post as CmsPost;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cms-posts"] });
      qc.invalidateQueries({ queryKey: ["cms-post", vars.id] });
    },
  });
}

export function useDeletePost() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await invokePostsFn("delete", { id }, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-posts"] }),
  });
}

// ── Categories ────────────────────────────────────────────────────────

export function useCmsCategories() {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-categories"],
    queryFn: async () => {
      const res = await invokePostsFn("list_categories", {}, token);
      return res.categories as Category[];
    },
    enabled: !!token,
  });
}

export function useCreateCategory() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug: string; description?: string }) => {
      const res = await invokePostsFn("create_category", body, token);
      return res.category as Category;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-categories"] }),
  });
}

export function useUpdateCategory() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id: string; name?: string; slug?: string; description?: string }) => {
      const res = await invokePostsFn("update_category", body, token);
      return res.category as Category;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-categories"] }),
  });
}

export function useDeleteCategory() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await invokePostsFn("delete_category", { id }, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-categories"] }),
  });
}

// ── Tags ──────────────────────────────────────────────────────────────

export function useCmsTags() {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-tags"],
    queryFn: async () => {
      const res = await invokePostsFn("list_tags", {}, token);
      return res.tags as Tag[];
    },
    enabled: !!token,
  });
}

export function useCreateTag() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug: string }) => {
      const res = await invokePostsFn("create_tag", body, token);
      return res.tag as Tag;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-tags"] }),
  });
}

export function useDeleteTag() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await invokePostsFn("delete_tag", { id }, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-tags"] }),
  });
}
