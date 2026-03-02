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
  type: "heading" | "paragraph" | "image" | "html" | "spacer" | "component" | "row";
  data: Record<string, unknown>;
}

/** A single column inside a row block */
export interface ColumnData {
  id: string;
  /** Width fraction out of 12 (e.g. 6 = half) */
  span: number;
  blocks: ContentBlock[];
}

/** Preset layout options */
export const ROW_LAYOUTS = [
  { label: "1 Column", value: "12", columns: [12] },
  { label: "2 Equal", value: "6-6", columns: [6, 6] },
  { label: "3 Equal", value: "4-4-4", columns: [4, 4, 4] },
  { label: "2/3 + 1/3", value: "8-4", columns: [8, 4] },
  { label: "1/3 + 2/3", value: "4-8", columns: [4, 8] },
  { label: "1/4 + 3/4", value: "3-9", columns: [3, 9] },
  { label: "4 Equal", value: "3-3-3-3", columns: [3, 3, 3, 3] },
] as const;

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
        method: "POST",
        body: { action: "update", ...page },
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
        method: "POST",
        body: { action: "delete", id },
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
