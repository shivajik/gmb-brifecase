import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsAuth } from "@/contexts/CmsAuthContext";

export interface CmsWidget {
  id: string;
  title: string | null;
  widget_type: string;
  location: string;
  content: Record<string, unknown>;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCmsWidgets() {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-widgets", {
        method: "POST",
        body: { action: "list" },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.widgets as CmsWidget[];
    },
    enabled: !!token,
  });
}

export function useCreateWidget() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (widget: Partial<CmsWidget>) => {
      const { data, error } = await supabase.functions.invoke("cms-widgets", {
        method: "POST",
        body: { action: "create", ...widget },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.widget as CmsWidget;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-widgets"] }),
  });
}

export function useUpdateWidget() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (widget: Partial<CmsWidget> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke("cms-widgets", {
        method: "POST",
        body: { action: "update", ...widget },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.widget as CmsWidget;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-widgets"] }),
  });
}

export function useDeleteWidget() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("cms-widgets", {
        method: "POST",
        body: { action: "delete", id },
        headers: authHeaders(token),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-widgets"] }),
  });
}
