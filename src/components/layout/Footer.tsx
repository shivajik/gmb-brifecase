import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Twitter, Linkedin, Facebook, Youtube, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePublicMenus, buildMenuTree } from "@/hooks/usePublicMenus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaultFooterLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "GBP Management", href: "/features" },
    { label: "Review Monitoring", href: "/features" },
    { label: "Analytics", href: "/features" },
    { label: "Listings", href: "/features" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  Support: [
    { label: "Help Center", href: "/contact" },
    { label: "Documentation", href: "/contact" },
    { label: "API Reference", href: "/contact" },
    { label: "Status", href: "/contact" },
  ],
};

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
};

function useSocialSettings() {
  return useQuery({
    queryKey: ["public-social-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "social");
      if (error) throw error;
      const result: Record<string, string> = {};
      for (const row of data || []) {
        const val = typeof row.value === "object" && row.value !== null && "v" in (row.value as Record<string, unknown>)
          ? String((row.value as Record<string, unknown>).v ?? "")
          : String(row.value ?? "");
        if (val) result[row.key] = val;
      }
      return result;
    },
    staleTime: 60_000,
  });
}

export function Footer({ siteName = "GMB Briefcase", logoUrl = "" }: { siteName?: string; logoUrl?: string }) {
  const { data: footerMenus } = usePublicMenus("footer");
  const { data: socialLinks } = useSocialSettings();

  // Build footer columns from CMS footer menus, or fall back to defaults
  const footerColumns = useMemo(() => {
    if (footerMenus && footerMenus.length > 0) {
      // Each footer menu becomes a column, with its name as the heading
      return footerMenus.map((menu) => ({
        title: menu.name,
        links: menu.items
          .filter((item) => !item.parent_id) // top-level only
          .map((item) => ({
            label: item.label,
            href: item.url || "/",
            target: item.target || "_self",
          })),
      }));
    }
    // Fallback
    return Object.entries(defaultFooterLinks).map(([title, links]) => ({
      title,
      links,
    }));
  }, [footerMenus]);

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <span>{siteName}</span>
            </Link>
            <p className="text-sm opacity-70 max-w-xs">
              The all-in-one platform to manage, optimize, and grow your local business presence on Google.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  placeholder="your@email.com"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40 max-w-[220px]"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Dynamic link columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="font-semibold text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      target={(link as any).target === "_blank" ? "_blank" : undefined}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-60">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-xs opacity-60 hover:opacity-100">Privacy Policy</Link>
            <Link to="#" className="text-xs opacity-60 hover:opacity-100">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(socialLinks || {}).map(([platform, url]) => {
              const Icon = socialIconMap[platform];
              if (!Icon || !url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  data-testid={`link-social-${platform}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
