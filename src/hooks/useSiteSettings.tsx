import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSetting {
  key: string;
  value: { v: string } | string;
}

function extractVal(s: SiteSetting): string {
  const v = s.value;
  if (typeof v === "object" && v !== null && "v" in v) return String(v.v ?? "");
  return String(v ?? "");
}

export function useSiteSettings() {
  const { data: generalSettings } = useQuery({
    queryKey: ["public-general-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "general");
      if (error) throw error;
      return data as SiteSetting[];
    },
    staleTime: 60_000,
  });

  const { data: advancedSettings } = useQuery({
    queryKey: ["public-advanced-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "advanced");
      if (error) throw error;
      return data as SiteSetting[];
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!generalSettings?.length) return;
    const map: Record<string, string> = {};
    generalSettings.forEach((s) => (map[s.key] = extractVal(s)));

    if (map.site_name) {
      const current = document.title;
      if (!current || current.includes("GMB Briefcase")) {
        document.title = current.replace("GMB Briefcase", map.site_name);
      }
    }

    if (map.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", map.description);
    }

    if (map.favicon_url) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (link) {
        link.href = map.favicon_url;
      } else {
        link = document.createElement("link");
        link.rel = "icon";
        link.href = map.favicon_url;
        document.head.appendChild(link);
      }
    }

    if (map.logo_url) {
      document.documentElement.setAttribute("data-logo-url", map.logo_url);
    }

    if (map.site_name) {
      document.documentElement.setAttribute("data-site-name", map.site_name);
    }
  }, [generalSettings]);

  useEffect(() => {
    if (!advancedSettings?.length) return;
    const map: Record<string, string> = {};
    advancedSettings.forEach((s) => (map[s.key] = extractVal(s)));

    if (map.google_analytics_id) {
      const gaId = map.google_analytics_id.trim();
      if (gaId && !document.getElementById("ga-script")) {
        const script1 = document.createElement("script");
        script1.id = "ga-script";
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.id = "ga-config";
        script2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
        document.head.appendChild(script2);
      }
    }

    if (map.head_scripts) {
      const existing = document.getElementById("cms-head-scripts");
      if (!existing) {
        const container = document.createElement("div");
        container.id = "cms-head-scripts";
        container.innerHTML = map.head_scripts;
        const scripts = container.querySelectorAll("script");
        scripts.forEach((origScript) => {
          const newScript = document.createElement("script");
          Array.from(origScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.textContent = origScript.textContent;
          document.head.appendChild(newScript);
        });
        const nonScripts = container.querySelectorAll(":not(script)");
        nonScripts.forEach((el) => document.head.appendChild(el.cloneNode(true)));
      }
    }

    if (map.footer_scripts) {
      const existing = document.getElementById("cms-footer-scripts");
      if (!existing) {
        const container = document.createElement("div");
        container.id = "cms-footer-scripts";
        container.innerHTML = map.footer_scripts;
        const scripts = container.querySelectorAll("script");
        scripts.forEach((origScript) => {
          const newScript = document.createElement("script");
          Array.from(origScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.textContent = origScript.textContent;
          document.body.appendChild(newScript);
        });
      }
    }
  }, [advancedSettings]);

  const generalMap: Record<string, string> = {};
  generalSettings?.forEach((s) => (generalMap[s.key] = extractVal(s)));

  return {
    siteName: generalMap.site_name || "GMB Briefcase",
    tagline: generalMap.tagline || "",
    logoUrl: generalMap.logo_url || "",
    faviconUrl: generalMap.favicon_url || "",
  };
}
