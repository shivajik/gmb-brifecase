import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsAuth } from "@/contexts/CmsAuthContext";
import { useCallback } from "react";

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  template: string | null;
  content: ContentBlock[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
}

export interface ContentBlock {
  id: string;
  type: "heading" | "paragraph" | "image" | "html" | "spacer";
  data: Record<string, unknown>;
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCmsPages(filters?: { status?: string; search?: string }) {
  const { token } = useCmsAuth();

  return useQuery({
    queryKey: ["cms-pages", filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-pages", {
        method: "POST",
        body: { action: "list", status: filters?.status, search: filters?.search },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.pages as CmsPage[];
    },
    enabled: !!token,
  });
}

export function useCmsPage(id: string | undefined) {
  const { token } = useCmsAuth();

  return useQuery({
    queryKey: ["cms-page", id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-pages", {
        method: "POST",
        body: { action: "get", id },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.page as CmsPage;
    },
    enabled: !!token && !!id,
  });
}

export function useCreatePage() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (page: Partial<CmsPage>) => {
      const { data, error } = await supabase.functions.invoke("cms-pages", {
        method: "POST",
        body: page,
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.page as CmsPage;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-pages"] }),
  });
}

export function useUpdatePage() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (page: Partial<CmsPage> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke("cms-pages", {
        method: "PUT",
        body: page,
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.page as CmsPage;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cms-pages"] });
      qc.invalidateQueries({ queryKey: ["cms-page", vars.id] });
    },
  });
}

export function useDeletePage() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("cms-pages", {
        method: "DELETE",
        body: { id },
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-pages"] }),
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
