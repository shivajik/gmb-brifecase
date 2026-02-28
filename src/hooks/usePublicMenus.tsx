import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicMenuItem {
  id: string;
  label: string;
  url: string | null;
  parent_id: string | null;
  target: string | null;
  css_class: string | null;
  icon: string | null;
  description: string | null;
  sort_order: number;
}

export interface PublicMenu {
  id: string;
  name: string;
  location: "header" | "footer" | "sidebar";
  items: PublicMenuItem[];
}

/**
 * Fetches menus + items for a given location from the public tables.
 * Uses the public RLS policies (SELECT allowed on menus and menu_items).
 */
export function usePublicMenus(location: "header" | "footer" | "sidebar") {
  return useQuery({
    queryKey: ["public-menus", location],
    queryFn: async () => {
      // Fetch menus at this location
      const { data: menus, error: menuErr } = await supabase
        .from("menus")
        .select("id, name, location")
        .eq("location", location)
        .order("created_at", { ascending: true });

      if (menuErr) throw menuErr;
      if (!menus || menus.length === 0) return [];

      // Fetch items for all menus at this location
      const menuIds = menus.map((m) => m.id);
      const { data: items, error: itemsErr } = await supabase
        .from("menu_items")
        .select("id, menu_id, label, url, parent_id, target, css_class, icon, description, sort_order")
        .in("menu_id", menuIds)
        .order("sort_order", { ascending: true });

      if (itemsErr) throw itemsErr;

      // Group items by menu
      return menus.map((menu) => ({
        ...menu,
        items: (items || []).filter((item) => item.menu_id === menu.id),
      })) as PublicMenu[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Build a tree structure from flat items (top-level + children).
 */
export function buildMenuTree(items: PublicMenuItem[]) {
  const topLevel = items.filter((i) => !i.parent_id);
  const children = items.filter((i) => i.parent_id);

  return topLevel.map((parent) => ({
    ...parent,
    children: children.filter((c) => c.parent_id === parent.id),
  }));
}
