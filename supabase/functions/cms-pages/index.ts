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

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Last segment could be an action or page ID
  const lastSegment = pathParts[pathParts.length - 1];
  const db = getSupabaseAdmin();

  try {
    // GET /cms-pages or /cms-pages/list
    if (req.method === "GET") {
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search");
      let query = db.from("pages").select("id, title, slug, status, template, author_id, created_at, updated_at, published_at, meta_title, meta_description").order("updated_at", { ascending: false });
      if (status) query = query.eq("status", status);
      if (search) query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return json({ pages: data });
    }

    // POST - create or get single
    if (req.method === "POST") {
      const body = await req.json();

      // If action=get, fetch single page
      if (body.action === "get") {
        const { data, error } = await db.from("pages").select("*").eq("id", body.id).single();
        if (error) return json({ error: "Page not found" }, 404);
        return json({ page: data });
      }

      // Create page
      const { title, slug, content, status, template, meta_title, meta_description, meta_keywords, og_image } = body;
      if (!title || !slug) return json({ error: "Title and slug required" }, 400);

      const insertData: Record<string, unknown> = {
        title, slug,
        content: content || [],
        status: status || "draft",
        template: template || "default",
        author_id: payload.sub,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        meta_keywords: meta_keywords || null,
        og_image: og_image || null,
      };
      if (status === "published") insertData.published_at = new Date().toISOString();

      const { data, error } = await db.from("pages").insert(insertData).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }
      return json({ page: data }, 201);
    }

    // PUT - update
    if (req.method === "PUT") {
      const body = await req.json();
      if (!body.id) return json({ error: "Page ID required" }, 400);

      const updates: Record<string, unknown> = {};
      for (const key of ["title", "slug", "content", "status", "template", "meta_title", "meta_description", "meta_keywords", "og_image"]) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      // Auto-set published_at
      if (updates.status === "published") {
        const { data: existing } = await db.from("pages").select("published_at").eq("id", body.id).single();
        if (!existing?.published_at) updates.published_at = new Date().toISOString();
      }

      const { data, error } = await db.from("pages").update(updates).eq("id", body.id).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }
      return json({ page: data });
    }

    // DELETE
    if (req.method === "DELETE") {
      const body = await req.json();
      if (!body.id) return json({ error: "Page ID required" }, 400);
      const { error } = await db.from("pages").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("cms-pages error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
