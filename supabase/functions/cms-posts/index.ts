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
    const sigBytes = new Uint8Array(base64urlDecode(parts[2]).buffer as ArrayBuffer);
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

  const db = getSupabaseAdmin();

  try {
    const body = await req.json();
    const action = body.action;

    // ─── Public actions (no auth needed) ─────────────────────────────
    if (action === "public_list") {
      let query = db.from("posts")
        .select("id, title, slug, excerpt, featured_image, status, category_id, author_id, published_at, created_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (body.category_id) query = query.eq("category_id", body.category_id);
      if (body.limit) query = query.limit(body.limit);
      if (body.offset) query = query.range(body.offset, body.offset + (body.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;

      // Fetch tags for each post
      const postIds = (data || []).map((p: any) => p.id);
      let postTags: any[] = [];
      if (postIds.length > 0) {
        const { data: pt } = await db.from("post_tags")
          .select("post_id, tag_id, tags(id, name, slug)")
          .in("post_id", postIds);
        postTags = pt || [];
      }

      // Fetch categories
      const { data: categories } = await db.from("categories").select("id, name, slug");

      // Fetch author names
      const authorIds = [...new Set((data || []).map((p: any) => p.author_id).filter(Boolean))];
      let authors: any[] = [];
      if (authorIds.length > 0) {
        const { data: a } = await db.from("cms_users").select("id, name, email").in("id", authorIds);
        authors = a || [];
      }

      const posts = (data || []).map((post: any) => ({
        ...post,
        category: (categories || []).find((c: any) => c.id === post.category_id) || null,
        author: authors.find((a: any) => a.id === post.author_id) || null,
        tags: postTags.filter((pt: any) => pt.post_id === post.id).map((pt: any) => pt.tags),
      }));

      return json({ posts, categories: categories || [] });
    }

    if (action === "public_get") {
      const { data, error } = await db.from("posts").select("*").eq("slug", body.slug).eq("status", "published").single();
      if (error) return json({ error: "Post not found" }, 404);

      // Get tags
      const { data: pt } = await db.from("post_tags")
        .select("tag_id, tags(id, name, slug)")
        .eq("post_id", data.id);

      // Get category
      let category = null;
      if (data.category_id) {
        const { data: cat } = await db.from("categories").select("id, name, slug").eq("id", data.category_id).single();
        category = cat;
      }

      // Get author
      let author = null;
      if (data.author_id) {
        const { data: a } = await db.from("cms_users").select("id, name, email").eq("id", data.author_id).single();
        author = a;
      }

      return json({
        post: {
          ...data,
          category,
          author,
          tags: (pt || []).map((t: any) => t.tags),
        },
      });
    }

    if (action === "public_categories") {
      const { data, error } = await db.from("categories").select("*").order("name");
      if (error) throw error;
      return json({ categories: data });
    }

    if (action === "public_tags") {
      const { data, error } = await db.from("tags").select("*").order("name");
      if (error) throw error;
      return json({ tags: data });
    }

    // ─── Admin actions (auth required) ───────────────────────────────
    const payload = await authenticate(req);
    if (!payload) return json({ error: "Unauthorized" }, 401);

    // ── Posts CRUD ───────────────────────────────────────────────────
    if (action === "list") {
      let query = db.from("posts")
        .select("id, title, slug, excerpt, featured_image, status, editor_mode, category_id, author_id, published_at, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (body.status) query = query.eq("status", body.status);
      if (body.search) query = query.or(`title.ilike.%${body.search}%,slug.ilike.%${body.search}%`);
      const { data, error } = await query;
      if (error) throw error;

      // Get categories for display
      const { data: categories } = await db.from("categories").select("id, name, slug");

      const posts = (data || []).map((post: any) => ({
        ...post,
        category: (categories || []).find((c: any) => c.id === post.category_id) || null,
      }));

      return json({ posts });
    }

    if (action === "get") {
      const { data, error } = await db.from("posts").select("*").eq("id", body.id).single();
      if (error) return json({ error: "Post not found" }, 404);

      const { data: pt } = await db.from("post_tags")
        .select("tag_id")
        .eq("post_id", data.id);

      return json({ post: { ...data, tag_ids: (pt || []).map((t: any) => t.tag_id) } });
    }

    if (action === "create") {
      const { title, slug, excerpt, content, featured_image, status, editor_mode, category_id, meta_title, meta_description, tag_ids } = body;
      if (!title || !slug) return json({ error: "Title and slug required" }, 400);

      const insertData: Record<string, unknown> = {
        title, slug,
        excerpt: excerpt || null,
        content: content || [],
        featured_image: featured_image || null,
        status: status || "draft",
        editor_mode: editor_mode || "simple",
        category_id: category_id || null,
        author_id: payload.sub,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
      };
      if (status === "published") insertData.published_at = new Date().toISOString();

      const { data, error } = await db.from("posts").insert(insertData).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }

      // Insert tags
      if (tag_ids && tag_ids.length > 0) {
        await db.from("post_tags").insert(
          tag_ids.map((tag_id: string) => ({ post_id: data.id, tag_id }))
        );
      }

      return json({ post: data }, 201);
    }

    if (action === "update") {
      if (!body.id) return json({ error: "Post ID required" }, 400);
      const updates: Record<string, unknown> = {};
      for (const key of ["title", "slug", "excerpt", "content", "featured_image", "status", "editor_mode", "category_id", "meta_title", "meta_description"]) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (updates.status === "published") {
        const { data: existing } = await db.from("posts").select("published_at").eq("id", body.id).single();
        if (!existing?.published_at) updates.published_at = new Date().toISOString();
      }

      const { data, error } = await db.from("posts").update(updates).eq("id", body.id).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }

      // Update tags
      if (body.tag_ids !== undefined) {
        await db.from("post_tags").delete().eq("post_id", body.id);
        if (body.tag_ids.length > 0) {
          await db.from("post_tags").insert(
            body.tag_ids.map((tag_id: string) => ({ post_id: body.id, tag_id }))
          );
        }
      }

      return json({ post: data });
    }

    if (action === "delete") {
      if (!body.id) return json({ error: "Post ID required" }, 400);
      const { error } = await db.from("posts").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    if (action === "bulk_create") {
      const posts = body.posts as Array<{
        title: string;
        slug: string;
        excerpt?: string;
        content?: unknown[];
        featured_image?: string;
        status?: string;
        editor_mode?: string;
        category_id?: string;
        meta_title?: string;
        meta_description?: string;
      }>;
      if (!posts || !Array.isArray(posts) || posts.length === 0) {
        return json({ error: "Posts array required" }, 400);
      }

      const results: { title: string; slug: string; success: boolean; error?: string }[] = [];

      for (const post of posts) {
        try {
          if (!post.title || !post.slug) {
            results.push({ title: post.title || "", slug: post.slug || "", success: false, error: "Title and slug required" });
            continue;
          }
          const insertData: Record<string, unknown> = {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || null,
            content: post.content || [],
            featured_image: post.featured_image || null,
            status: post.status || "published",
            editor_mode: post.editor_mode || "simple",
            category_id: post.category_id || null,
            author_id: payload.sub,
            meta_title: post.meta_title || null,
            meta_description: post.meta_description || null,
            published_at: new Date().toISOString(),
          };
          const { error: insertError } = await db.from("posts").insert(insertData).select().single();
          if (insertError) {
            results.push({ title: post.title, slug: post.slug, success: false, error: insertError.code === "23505" ? "Slug already exists" : insertError.message });
          } else {
            results.push({ title: post.title, slug: post.slug, success: true });
          }
        } catch (e: any) {
          results.push({ title: post.title, slug: post.slug, success: false, error: e.message || "Unknown error" });
        }
      }

      return json({ results, created: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length });
    }

    // ── Categories CRUD ─────────────────────────────────────────────
    if (action === "list_categories") {
      const { data, error } = await db.from("categories").select("*").order("name");
      if (error) throw error;
      return json({ categories: data });
    }

    if (action === "create_category") {
      const { name, slug, description } = body;
      if (!name || !slug) return json({ error: "Name and slug required" }, 400);
      const { data, error } = await db.from("categories").insert({ name, slug, description: description || null }).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }
      return json({ category: data }, 201);
    }

    if (action === "update_category") {
      if (!body.id) return json({ error: "Category ID required" }, 400);
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.slug !== undefined) updates.slug = body.slug;
      if (body.description !== undefined) updates.description = body.description;
      const { data, error } = await db.from("categories").update(updates).eq("id", body.id).select().single();
      if (error) throw error;
      return json({ category: data });
    }

    if (action === "delete_category") {
      if (!body.id) return json({ error: "Category ID required" }, 400);
      const { error } = await db.from("categories").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    // ── Tags CRUD ───────────────────────────────────────────────────
    if (action === "list_tags") {
      const { data, error } = await db.from("tags").select("*").order("name");
      if (error) throw error;
      return json({ tags: data });
    }

    if (action === "create_tag") {
      const { name, slug } = body;
      if (!name || !slug) return json({ error: "Name and slug required" }, 400);
      const { data, error } = await db.from("tags").insert({ name, slug }).select().single();
      if (error) {
        if (error.code === "23505") return json({ error: "Slug already exists" }, 409);
        throw error;
      }
      return json({ tag: data }, 201);
    }

    if (action === "delete_tag") {
      if (!body.id) return json({ error: "Tag ID required" }, 400);
      const { error } = await db.from("tags").delete().eq("id", body.id);
      if (error) throw error;
      return json({ message: "Deleted" });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("cms-posts error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
