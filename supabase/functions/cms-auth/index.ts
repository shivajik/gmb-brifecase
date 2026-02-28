import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64url } from "https://deno.land/std@0.208.0/encoding/base64url.ts";
import { encode as hexEncode } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Simple password hashing using Web Crypto API (PBKDF2)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = new TextDecoder().decode(hexEncode(salt));
  const hashHex = new TextDecoder().decode(hexEncode(hashArray));
  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1]);
  const saltHex = parts[2];
  const storedHashHex = parts[3];

  // Decode hex salt
  const saltBytes = new Uint8Array(saltHex.length / 2);
  for (let i = 0; i < saltHex.length; i += 2) {
    saltBytes[i / 2] = parseInt(saltHex.substring(i, i + 2), 16);
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = new TextDecoder().decode(hexEncode(new Uint8Array(derivedBits)));
  return hashHex === storedHashHex;
}

// Generate a secure random token
function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64url(bytes);
}

// Create a simple JWT-like token (signed with HMAC-SHA256)
async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();

  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigB64 = base64url(new Uint8Array(signature));

  return `${data}.${sigB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const enc = new TextEncoder();
    const data = `${parts[0]}.${parts[1]}`;

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode signature
    const sigBytes = base64urlDecode(parts[2]);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64urlDecode(parts[1]));
    const payload = JSON.parse(payloadJson);

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

function base64urlDecode(str: string): Uint8Array {
  // Add padding
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

const JWT_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Using service role key as JWT signing secret

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    switch (path) {
      case "login":
        return await handleLogin(req);
      case "register":
        return await handleRegister(req);
      case "logout":
        return await handleLogout(req);
      case "verify":
        return await handleVerify(req);
      default:
        return jsonResponse({ error: "Not found" }, 404);
    }
  } catch (err) {
    console.error("CMS Auth error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

async function handleLogin(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return jsonResponse({ error: "Email and password required" }, 400);
  }

  const supabase = getSupabaseAdmin();

  // Get user
  const { data: user, error } = await supabase
    .from("cms_users")
    .select("id, email, name, password_hash, is_active")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !user) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }

  if (!user.is_active) {
    return jsonResponse({ error: "Account deactivated" }, 403);
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }

  // Get roles
  const { data: roles } = await supabase
    .from("cms_user_roles")
    .select("role")
    .eq("user_id", user.id);

  const userRoles = roles?.map((r: { role: string }) => r.role) || [];

  // Create session token
  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await supabase.from("cms_sessions").insert({
    user_id: user.id,
    token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  // Create JWT
  const jwt = await createJWT(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles,
      session: sessionToken,
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    JWT_SECRET
  );

  return jsonResponse({
    token: jwt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles,
    },
    expires_at: expiresAt.toISOString(),
  });
}

async function handleRegister(req: Request) {
  // Check if caller is admin
  const authHeader = req.headers.get("authorization");
  const supabase = getSupabaseAdmin();

  // Check if any users exist (allow first user creation without auth)
  const { count } = await supabase
    .from("cms_users")
    .select("id", { count: "exact", head: true });

  const isFirstUser = count === 0;

  if (!isFirstUser) {
    // Require admin auth for subsequent registrations
    if (!authHeader) {
      return jsonResponse({ error: "Authorization required" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    const roles = (payload.roles as string[]) || [];
    if (!roles.includes("admin")) {
      return jsonResponse({ error: "Admin access required" }, 403);
    }
  }

  const { email, password, name, role } = await req.json();
  if (!email || !password) {
    return jsonResponse({ error: "Email and password required" }, 400);
  }

  if (password.length < 8) {
    return jsonResponse({ error: "Password must be at least 8 characters" }, 400);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const { data: newUser, error } = await supabase
    .from("cms_users")
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name || null,
    })
    .select("id, email, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      return jsonResponse({ error: "Email already exists" }, 409);
    }
    throw error;
  }

  // Assign role
  const assignedRole = isFirstUser ? "admin" : role || "editor";
  await supabase.from("cms_user_roles").insert({
    user_id: newUser.id,
    role: assignedRole,
  });

  return jsonResponse({
    user: { ...newUser, roles: [assignedRole] },
    message: isFirstUser
      ? "Admin account created successfully"
      : "User created successfully",
  }, 201);
}

async function handleLogout(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Authorization required" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || !payload.session) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  const supabase = getSupabaseAdmin();
  await supabase
    .from("cms_sessions")
    .delete()
    .eq("token", payload.session as string);

  return jsonResponse({ message: "Logged out successfully" });
}

async function handleVerify(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Authorization required" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
  }

  // Verify session still exists in DB
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from("cms_sessions")
    .select("id, expires_at")
    .eq("token", payload.session as string)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!session) {
    return jsonResponse({ error: "Session expired" }, 401);
  }

  // Get fresh roles
  const { data: roles } = await supabase
    .from("cms_user_roles")
    .select("role")
    .eq("user_id", payload.sub as string);

  return jsonResponse({
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: roles?.map((r: { role: string }) => r.role) || [],
    },
    expires_at: session.expires_at,
  });
}
