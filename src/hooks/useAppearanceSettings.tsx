import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AppearanceSetting {
  key: string;
  value: { v: string } | string;
}

/** Convert hex (#rrggbb) to "H S% L%" for CSS custom properties */
function hexToHSL(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255;
  let g = parseInt(m[2], 16) / 255;
  let b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const COLOR_MAP: Record<string, string> = {
  primary_color: "--primary",
  secondary_color: "--secondary",
  accent_color: "--accent",
};

const GRADIENT_MAP: Record<string, string> = {
  hero_gradient_from: "--hero-gradient-start",
  hero_gradient_to: "--hero-gradient-end",
};

/** Load a Google Font dynamically */
function loadGoogleFont(family: string) {
  if (family === "system-ui") return;
  const id = `gfont-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function useAppearanceSettings() {
  const { data: settings } = useQuery({
    queryKey: ["public-appearance-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "appearance");
      if (error) throw error;
      return data as AppearanceSetting[];
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!settings?.length) return;
    const root = document.documentElement;

    for (const s of settings) {
      const val = typeof s.value === "object" && s.value !== null && "v" in s.value
        ? (s.value as { v: string }).v
        : String(s.value);

      // Colors → HSL custom properties
      if (COLOR_MAP[s.key]) {
        const hsl = hexToHSL(val);
        if (hsl) root.style.setProperty(COLOR_MAP[s.key], hsl);
      }

      // Gradient colors
      if (GRADIENT_MAP[s.key]) {
        const hsl = hexToHSL(val);
        if (hsl) root.style.setProperty(GRADIENT_MAP[s.key], hsl);
      }

      // Fonts
      if (s.key === "heading_font") {
        loadGoogleFont(val);
        root.style.setProperty("--font-heading", `'${val}', system-ui, sans-serif`);
      }
      if (s.key === "body_font") {
        loadGoogleFont(val);
        root.style.setProperty("--font-body", `'${val}', system-ui, sans-serif`);
      }

      // Border radius
      if (s.key === "border_radius") {
        root.style.setProperty("--radius", val);
      }
    }
  }, [settings]);
}
