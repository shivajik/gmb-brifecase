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
        const rows = items.map((item: Record<string, unknown>, idx: number) => ({
          menu_id: body.menu_id,
          label: item.label,
          url: item.url || null,
          page_id: item.page_id || null,
          parent_id: item.parent_id || null,
          target: item.target || "_self",
          css_class: item.css_class || null,
          icon: item.icon || null,
          description: item.description || null,
          sort_order: idx,
        }));

        const { error } = await db.from("menu_items").insert(rows);
        if (error) throw error;
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
