import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsAuth } from "@/contexts/CmsAuthContext";

export interface CmsSetting {
  id: string;
  key: string;
  group: string;
  value: Record<string, unknown> | string | number | boolean;
  created_at: string;
  updated_at: string;
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCmsSettings(group?: string) {
  const { token } = useCmsAuth();
  return useQuery({
    queryKey: ["cms-settings", group],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("cms-settings", {
        method: "POST",
        body: { action: "list", group },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.settings as CmsSetting[];
    },
    enabled: !!token,
  });
}

export function useUpsertSetting() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (setting: { key: string; group?: string; value: unknown }) => {
      const { data, error } = await supabase.functions.invoke("cms-settings", {
        method: "POST",
        body: { action: "upsert", ...setting },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.setting as CmsSetting;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-settings"] }),
  });
}

export function useBulkUpsertSettings() {
  const { token } = useCmsAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { key: string; group?: string; value: unknown }[]) => {
      const { data, error } = await supabase.functions.invoke("cms-settings", {
        method: "POST",
        body: { action: "bulk_upsert", settings },
        headers: authHeaders(token),
      });
      if (error) throw error;
      return data.settings as CmsSetting[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-settings"] }),
  });
}
