import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CmsUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

interface CmsAuthState {
  user: CmsUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface CmsAuthContextValue extends CmsAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const CmsAuthContext = createContext<CmsAuthContextValue | null>(null);

export function CmsAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CmsAuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const tokenRef = useRef<string | null>(null);

  const setAuth = useCallback((user: CmsUser | null, token: string | null) => {
    tokenRef.current = token;
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: !!user,
    });
  }, []);

  // Try to restore session from sessionStorage (tab-scoped, not localStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("cms_token");
    if (!stored) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    // Verify the stored token
    supabase.functions
      .invoke("cms-auth/verify", {
        headers: { Authorization: `Bearer ${stored}` },
      })
      .then(({ data, error }) => {
        if (error || !data?.user) {
          sessionStorage.removeItem("cms_token");
          setState((s) => ({ ...s, isLoading: false }));
        } else {
          setAuth(data.user, stored);
        }
      });
  }, [setAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.functions.invoke("cms-auth/login", {
          body: { email, password },
        });

        if (error) {
          // Edge function errors come through differently
          const msg = typeof error === "object" && "message" in error ? error.message : "Login failed";
          return { success: false, error: msg };
        }

        if (data?.error) {
          return { success: false, error: data.error };
        }

        if (data?.token && data?.user) {
          sessionStorage.setItem("cms_token", data.token);
          setAuth(data.user, data.token);
          return { success: true };
        }

        return { success: false, error: "Unexpected response" };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Login failed";
        return { success: false, error: message };
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    const currentToken = tokenRef.current;
    if (currentToken) {
      await supabase.functions
        .invoke("cms-auth/logout", {
          headers: { Authorization: `Bearer ${currentToken}` },
        })
        .catch(() => {});
    }
    sessionStorage.removeItem("cms_token");
    setAuth(null, null);
  }, [setAuth]);

  const hasRole = useCallback(
    (role: string) => {
      return state.user?.roles?.includes(role) ?? false;
    },
    [state.user]
  );

  return (
    <CmsAuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </CmsAuthContext.Provider>
  );
}

export function useCmsAuth() {
  const ctx = useContext(CmsAuthContext);
  if (!ctx) throw new Error("useCmsAuth must be used within CmsAuthProvider");
  return ctx;
}
