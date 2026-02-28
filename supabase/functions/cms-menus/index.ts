import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function base64urlDecode(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const enc = new TextEncoder();
    const data = `${parts[0]}.${parts[1]}`;
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigBytes = base64urlDecode(parts[2]);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function authenticate(req: Request): Promise<Record<string, unknown> | null> {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return verifyJWT(auth.replace("Bearer ", ""));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const payload = await authenticate(req);
  if (!payload) return json({ error: "Unauthorized" }, 401);

  const db = getSupabaseAdmin();

  try {
    const body = req.method !== "GET" ? await req.json() : {};
    const action = body.action || req.method;

    // ─── LIST MENUS ──────────────────────────────────────
    if (action === "list" || (req.method === "GET" && !body.action)) {
      const { data, error } = await db
        .from("menus")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return json({ menus: data });
    }

    // ─── GET MENU WITH ITEMS ─────────────────────────────
    if (action === "get") {
      const { data: menu, error: menuErr } = await db
        .from("menus")
        .select("*")
        .eq("id", body.id)
        .single();
      if (menuErr) return json({ error: "Menu not found" }, 404);

      const { data: items, error: itemsErr } = await db
        .from("menu_items")
        .select("*")
        .eq("menu_id", body.id)
        .order("sort_order", { ascending: true });
      if (itemsErr) throw itemsErr;

      return json({ menu, items: items || [] });
    }

    // ─── CREATE MENU ─────────────────────────────────────
    if (action === "create") {
      const { name, location } = body;
      if (!name || !location) return json({ error: "Name and location required" }, 400);

      const { data, error } = await db
        .from("menus")
        .insert({ name, location })
        .select()
        .single();
      if (error) throw error;
      return json({ menu: data }, 201);
    }

    // ─── UPDATE MENU ─────────────────────────────────────
    if (action === "update") {
      if (!body.id) return json({ error: "Menu ID required" }, 400);
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.location !== undefined) updates.location = body.location;

      const { data, error } = await db
        .from("menus")
        .update(updates)
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;
      return json({ menu: data });
    }

    // ─── DELETE MENU ─────────────────────────────────────
    if (action === "delete") {
      if (!body.id) return json({ error: "Menu ID required" }, 400);
      // Delete items first
      await db.from("menu_items").delete().eq("menu_id", body.id);
      const { error } = await db.from("menus").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    // ─── SAVE MENU ITEMS (bulk replace) ──────────────────
    if (action === "save_items") {
      if (!body.menu_id) return json({ error: "menu_id required" }, 400);
      const items = body.items || [];

      // Delete existing items for this menu
      await db.from("menu_items").delete().eq("menu_id", body.menu_id);

      if (items.length > 0) {
        // Assign each item a temp index for parent resolution
        const indexed = items.map((item: Record<string, unknown>, idx: number) => ({
          ...item,
          _idx: idx,
        }));

        // Determine which items are top-level vs children
        // An item is a child if it has parent_id OR parent_index
        const isChild = (item: Record<string, unknown>) => {
          return item.parent_id || (item.parent_index !== undefined && item.parent_index !== null);
        };

        const topLevel = indexed.filter((item: Record<string, unknown>) => !isChild(item));
        const children = indexed.filter((item: Record<string, unknown>) => isChild(item));

        // Build a map from old parent_id -> sort_order index (for admin editor saves)
        // Items from admin have parent_id set to old UUIDs; we map them via position
        const oldIdToIdx: Record<string, number> = {};
        // The admin sends items with id fields that are the OLD ids
        for (const item of indexed) {
          if (item.id) {
            oldIdToIdx[item.id as string] = item._idx as number;
          }
        }

        // Insert top-level items first
        const topRows = topLevel.map((item: Record<string, unknown>) => ({
          menu_id: body.menu_id,
          label: item.label,
          url: item.url || null,
          page_id: item.page_id || null,
          parent_id: null,
          target: item.target || "_self",
          css_class: item.css_class || null,
          icon: item.icon || null,
          description: item.description || null,
          sort_order: item._idx as number,
        }));

        // Map from original index -> new DB id
        const idxToNewId: Record<number, string> = {};

        if (topRows.length > 0) {
          const { data: topData, error: topErr } = await db.from("menu_items").insert(topRows).select("id, sort_order");
          if (topErr) throw topErr;
          for (const row of topData || []) {
            idxToNewId[row.sort_order] = row.id;
          }
        }

        // Insert children with resolved parent_id
        if (children.length > 0) {
          const childRows = children.map((item: Record<string, unknown>) => {
            let resolvedParent: string | null = null;

            // Try parent_index first (used by seeding)
            if (item.parent_index !== undefined && item.parent_index !== null) {
              resolvedParent = idxToNewId[item.parent_index as number] || null;
            }
            // Otherwise resolve parent_id (old UUID from admin) via oldIdToIdx mapping
            else if (item.parent_id) {
              const parentOrigIdx = oldIdToIdx[item.parent_id as string];
              if (parentOrigIdx !== undefined) {
                resolvedParent = idxToNewId[parentOrigIdx] || null;
              }
            }

            return {
              menu_id: body.menu_id,
              label: item.label,
              url: item.url || null,
              page_id: item.page_id || null,
              parent_id: resolvedParent,
              target: item.target || "_self",
              css_class: item.css_class || null,
              icon: item.icon || null,
              description: item.description || null,
              sort_order: item._idx as number,
            };
          });
          const { error: childErr } = await db.from("menu_items").insert(childRows);
          if (childErr) throw childErr;
        }
      }

      // Return fresh items
      const { data: freshItems } = await db
        .from("menu_items")
        .select("*")
        .eq("menu_id", body.menu_id)
        .order("sort_order", { ascending: true });

      return json({ items: freshItems || [] });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("cms-menus error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
