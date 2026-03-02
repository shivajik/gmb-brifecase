import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicWidget {
  id: string;
  title: string | null;
  widget_type: string;
  location: string;
  content: Record<string, unknown>;
  active: boolean;
  sort_order: number;
}

/**
 * Fetch active widgets for a given location from the public site.
 * RLS policy allows SELECT on active widgets.
 */
export function usePublicWidgets(location?: string) {
  return useQuery({
    queryKey: ["public-widgets", location],
    queryFn: async () => {
      let query = supabase
        .from("widgets")
        .select("id, title, widget_type, location, content, active, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicWidget[];
    },
    staleTime: 60_000,
  });
}
