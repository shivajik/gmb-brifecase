import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsAuth } from "@/contexts/CmsAuthContext";

export interface CmsMenu {
  id: string;
  name: string;
  location: "header" | "footer" | "sidebar";
  created_at: string;
  updated_at: string;
}

export interface CmsMenuItem {
  id: string;
  menu_id: string;
  label: string;
  url: string | null;
  page_id: string | null;
  parent_id: string | null;
  target: string | null;
  css_class: string | null;
  sort_order: number;
  created_at: string;
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCmsMenus() {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-menus"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "list" },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.menus as CmsMenu[];
    },
    enabled: !!token,
  });
}

export function useCmsMenu(id: string | undefined) {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-menu", id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "get", id },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return { menu: data.menu as CmsMenu, items: data.items as CmsMenuItem[] };
    },
    enabled: !!token && !!id,
  });
}

export function useCreateMenu() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (menu: { name: string; location: string }) => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "create", ...menu },
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.menu as CmsMenu;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-menus"] }),
  });
}

export function useUpdateMenu() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (menu: { id: string; name?: string; location?: string }) => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "update", ...menu },
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.menu as CmsMenu;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cms-menus"] });
      qc.invalidateQueries({ queryKey: ["cms-menu", vars.id] });
    },
  });
}

export function useDeleteMenu() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "delete", id },
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-menus"] }),
  });
}

export function useSaveMenuItems() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { menu_id: string; items: Partial<CmsMenuItem>[] }) => {
      const { data, error } = await supabase.functions.invoke("cms-menus", {
        method: "POST",
        body: { action: "save_items", ...payload },
        headers: authHeaders(token),
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.items as CmsMenuItem[];
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cms-menu", vars.menu_id] });
    },
  });
}
