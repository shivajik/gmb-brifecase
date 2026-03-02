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
    const body = await req.json();

    // List all settings, optionally by group
    if (body.action === "list") {
      let query = db.from("site_settings").select("*").order("group").order("key");
      if (body.group) query = query.eq("group", body.group);
      const { data, error } = await query;
      if (error) throw error;
      return json({ settings: data });
    }

    // Upsert a setting (by key + group)
    if (body.action === "upsert") {
      if (!body.key) return json({ error: "Key required" }, 400);
      const group = body.group || "general";

      // Check if exists
      const { data: existing } = await db
        .from("site_settings")
        .select("id")
        .eq("key", body.key)
        .eq("group", group)
        .maybeSingle();

      if (existing) {
        const { data, error } = await db
          .from("site_settings")
          .update({ value: body.value ?? {} })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return json({ setting: data });
      } else {
        const { data, error } = await db
          .from("site_settings")
          .insert({ key: body.key, group, value: body.value ?? {} })
          .select()
          .single();
        if (error) throw error;
        return json({ setting: data }, 201);
      }
    }

    // Bulk upsert settings
    if (body.action === "bulk_upsert") {
      if (!Array.isArray(body.settings)) return json({ error: "settings array required" }, 400);
      const results = [];
      for (const s of body.settings) {
        const group = s.group || "general";
        const { data: existing } = await db
          .from("site_settings")
          .select("id")
          .eq("key", s.key)
          .eq("group", group)
          .maybeSingle();

        if (existing) {
          const { data } = await db
            .from("site_settings")
            .update({ value: s.value ?? {} })
            .eq("id", existing.id)
            .select()
            .single();
          results.push(data);
        } else {
          const { data } = await db
            .from("site_settings")
            .insert({ key: s.key, group, value: s.value ?? {} })
            .select()
            .single();
          results.push(data);
        }
      }
      return json({ settings: results });
    }

    // Delete a setting
    if (body.action === "delete") {
      if (!body.id) return json({ error: "Setting ID required" }, 400);
      const { error } = await db.from("site_settings").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("cms-settings error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
