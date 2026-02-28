import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicMenus, buildMenuTree, type PublicMenuItem } from "@/hooks/usePublicMenus";
import { getIconComponent } from "@/components/layout/headerIcons";
import type { LucideIcon } from "lucide-react";

// ─── Hardcoded mega-menu fallback data ───────────────────────────────

interface MegaLink {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

const platformLinks: MegaLink[] = [
  { icon: "MapPin", title: "GBP Management", desc: "Manage all your Google Business Profiles from one dashboard", href: "/features" },
  { icon: "BarChart3", title: "Analytics & Reporting", desc: "Insights and data to grow your local business", href: "/features" },
  { icon: "Users", title: "Multi-Location", desc: "Scale operations across all your locations", href: "/features" },
];

const productCards: MegaLink[] = [
  { icon: "Star", title: "Review Monitoring", desc: "Track, respond to, and generate reviews across 200+ sites.", href: "/features" },
  { icon: "FileText", title: "Listings Management", desc: "Keep your business info accurate and consistent everywhere.", href: "/features" },
  { icon: "Megaphone", title: "Posts & Updates", desc: "Create, schedule, and publish posts directly to Google.", href: "/features" },
  { icon: "BarChart3", title: "Rank Tracking", desc: "Monitor your local search rankings and track competitors.", href: "/features" },
  { icon: "MapPin", title: "Local SEO", desc: "Optimize your presence to rank higher in local search results.", href: "/features" },
  { icon: "BookOpen", title: "Reporting", desc: "Generate white-label reports for clients and stakeholders.", href: "/features" },
];

const solutionLinks: MegaLink[] = [
  { icon: "Building2", title: "Agencies", desc: "Manage clients at scale", href: "/features" },
  { icon: "ShoppingBag", title: "Small Businesses", desc: "Grow your local presence", href: "/features" },
  { icon: "Stethoscope", title: "Healthcare", desc: "Patient reviews & visibility", href: "/features" },
  { icon: "Scale", title: "Legal", desc: "Reputation for law firms", href: "/features" },
];

const resourceLinks: MegaLink[] = [
  { icon: "BookOpen", title: "Blog", desc: "Tips & strategies", href: "/about" },
  { icon: "HelpCircle", title: "Help Center", desc: "Guides & documentation", href: "/contact" },
  { icon: "Users", title: "Community", desc: "Connect with other users", href: "/about" },
];

const fallbackNavItems = [
  { label: "Products", key: "products" },
  { label: "Solutions", key: "solutions" },
  { label: "Resources", key: "resources" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const fallbackMegaData: Record<string, { platform?: MegaLink[]; items: MegaLink[] }> = {
  Products: { platform: platformLinks, items: productCards },
  Solutions: { items: solutionLinks },
  Resources: { items: resourceLinks },
};

// ─── Types ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  target?: string;
  key?: string;
  megaData?: { platform?: MegaLink[]; items: MegaLink[] };
}

// ─── Convert CMS items to nav structure ──────────────────────────────

function cmsToNavItems(items: PublicMenuItem[]): NavItem[] {
  const tree = buildMenuTree(items);
  return tree.map((node) => {
    const children = (node as any).children as PublicMenuItem[] | undefined;
    if (children && children.length > 0) {
      // Split: items with css_class "platform" go to platform section, rest to items
      const platformItems = children.filter((c) => c.css_class === "platform");
      const regularItems = children.filter((c) => c.css_class !== "platform");
      return {
        label: node.label,
        key: node.label.toLowerCase(),
        megaData: {
          platform: platformItems.length > 0
            ? platformItems.map((c) => ({
                icon: c.icon || "MapPin",
                title: c.label,
                desc: c.description || "",
                href: c.url || "/",
              }))
            : undefined,
          items: regularItems.map((c) => ({
            icon: c.icon || "MapPin",
            title: c.label,
            desc: c.description || "",
            href: c.url || "/",
          })),
        },
      };
    }
    return {
      label: node.label,
      href: node.url || "/",
      target: node.target || "_self",
    };
  });
}

// ─── Mega Panel Components ───────────────────────────────────────────

function MegaLinkCard({ link, onClose, variant }: { link: MegaLink; onClose: () => void; variant: "sidebar" | "card" }) {
  const Icon = getIconComponent(link.icon);

  if (variant === "sidebar") {
    return (
      <Link to={link.href} onClick={onClose} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
        {Icon && (
          <div className="mt-0.5 rounded-md bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <div className="font-medium text-sm text-foreground">{link.title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{link.desc}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={link.href} onClick={onClose} className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
      {Icon && (
        <div className="mb-3 rounded-md bg-primary/10 p-2 w-fit">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
      <div className="font-medium text-sm text-foreground mb-1">{link.title}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{link.desc}</div>
    </Link>
  );
}

function ProductsMegaPanel({ data, onClose }: { data: { platform?: MegaLink[]; items: MegaLink[] }; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[960px] max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-auto max-h-[calc(100vh-5rem)]" style={{ animationDuration: "0.2s" }}>
      <div className="py-8 px-6">
        <div className={cn(
          "grid gap-6",
          data.platform ? "grid-cols-[240px_1px_1fr] lg:grid-cols-1" : "grid-cols-1"
        )}>
          {data.platform && (
            <>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Platform</div>
                <div className="space-y-1">
                  {data.platform.map((link) => (
                    <MegaLinkCard key={link.title} link={link} onClose={onClose} variant="sidebar" />
                  ))}
                </div>
              </div>
              <div className="bg-border hidden xl:block" />
            </>
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Products</div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
              {data.items.map((card) => (
                <MegaLinkCard key={card.title} link={card} onClose={onClose} variant="card" />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link to="/features" onClick={onClose} className="text-sm font-medium text-primary hover:underline">See all Products →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StandardMegaPanel({ data, title, onClose }: { data: { items: MegaLink[] }; title: string; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[640px] max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in" style={{ animationDuration: "0.2s" }}>
      <div className="py-6 px-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{title}</div>
        <div className="grid grid-cols-2 gap-2">
          {data.items.map((link) => (
            <Link key={link.title} to={link.href} onClick={onClose} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
              {(() => { const I = getIconComponent(link.icon); return I ? <div className="mt-0.5 rounded-md bg-primary/10 p-2"><I className="h-5 w-5 text-primary" /></div> : null; })()}
              <div>
                <div className="font-medium text-sm text-foreground">{link.title}</div>
                <div className="text-xs text-muted-foreground">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Header Component ────────────────────────────────────────────────

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  const { data: headerMenus } = usePublicMenus("header");

  const navItems: NavItem[] = useMemo(() => {
    const cmsMenu = headerMenus?.[0];
    if (cmsMenu && cmsMenu.items.length > 0) {
      return cmsToNavItems(cmsMenu.items);
    }
    // Fallback to hardcoded items with mega data
    return fallbackNavItems.map((item) => ({
      ...item,
      megaData: item.key ? fallbackMegaData[item.label] : undefined,
    }));
  }, [headerMenus]);

  // Resolve mega data: CMS data or fallback
  const getMegaData = (item: NavItem) => {
    return item.megaData || fallbackMegaData[item.label];
  };

  const getAllMegaLinks = (item: NavItem) => {
    const md = getMegaData(item);
    if (!md) return [];
    return [...(md.platform || []), ...md.items];
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>GMB Briefcase</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 relative">
          {navItems.map((item) => {
            const hasMega = !!getMegaData(item);
            return hasMega ? (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
                  activeMenu === item.label ? "text-primary" : "text-muted-foreground"
                )}
                onMouseEnter={() => setActiveMenu(item.label)}
              >
                {item.label}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", activeMenu === item.label && "rotate-180")} />
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href || "/"}
                target={item.target === "_blank" ? "_blank" : undefined}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
                  location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mega menu panels */}
          {activeMenu && (() => {
            const item = navItems.find((i) => i.label === activeMenu);
            const md = item ? getMegaData(item) : null;
            if (!md) return null;
            // Use Products-style panel if it has a platform section or many items
            if (md.platform || md.items.length > 4) {
              return <ProductsMegaPanel data={md} onClose={() => setActiveMenu(null)} />;
            }
            return <StandardMegaPanel data={md} title={activeMenu} onClose={() => setActiveMenu(null)} />;
          })()}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/contact">Book a Demo</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/pricing">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => {
              const md = getMegaData(item);
              return md ? (
                <details key={item.label} className="group">
                  <summary className="py-2 text-sm font-medium text-foreground cursor-pointer flex items-center justify-between">
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-4 space-y-1 pb-2">
                    {getAllMegaLinks(item).map((link) => (
                      <Link key={link.title} to={link.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-primary">
                        {link.title}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={item.label}
                  to={item.href || "/"}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact" onClick={() => setMobileOpen(false)}>Book a Demo</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/pricing" onClick={() => setMobileOpen(false)}>Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
