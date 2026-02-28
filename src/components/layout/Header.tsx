import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BarChart3, Star, MapPin, FileText, Megaphone, Users, BookOpen, HelpCircle, Building2, ShoppingBag, Stethoscope, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicMenus, buildMenuTree } from "@/hooks/usePublicMenus";

// ─── Mega-menu static data (not CMS-managed) ────────────────────────
const platformLinks = [
  { icon: MapPin, title: "GBP Management", desc: "Manage all your Google Business Profiles from one dashboard", href: "/features" },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Insights and data to grow your local business", href: "/features" },
  { icon: Users, title: "Multi-Location", desc: "Scale operations across all your locations", href: "/features" },
];

const productCards = [
  { icon: Star, title: "Review Monitoring", desc: "Track, respond to, and generate reviews across 200+ sites.", href: "/features" },
  { icon: FileText, title: "Listings Management", desc: "Keep your business info accurate and consistent everywhere.", href: "/features" },
  { icon: Megaphone, title: "Posts & Updates", desc: "Create, schedule, and publish posts directly to Google.", href: "/features" },
  { icon: BarChart3, title: "Rank Tracking", desc: "Monitor your local search rankings and track competitors.", href: "/features" },
  { icon: MapPin, title: "Local SEO", desc: "Optimize your presence to rank higher in local search results.", href: "/features" },
  { icon: BookOpen, title: "Reporting", desc: "Generate white-label reports for clients and stakeholders.", href: "/features" },
];

const solutionLinks = [
  { icon: Building2, title: "Agencies", desc: "Manage clients at scale", href: "/features" },
  { icon: ShoppingBag, title: "Small Businesses", desc: "Grow your local presence", href: "/features" },
  { icon: Stethoscope, title: "Healthcare", desc: "Patient reviews & visibility", href: "/features" },
  { icon: Scale, title: "Legal", desc: "Reputation for law firms", href: "/features" },
];

const resourceLinks = [
  { icon: BookOpen, title: "Blog", desc: "Tips & strategies", href: "/about" },
  { icon: HelpCircle, title: "Help Center", desc: "Guides & documentation", href: "/contact" },
  { icon: Users, title: "Community", desc: "Connect with other users", href: "/about" },
];

// ─── Hardcoded fallback nav items ────────────────────────────────────
const fallbackNavItems = [
  { label: "Products", key: "products" },
  { label: "Solutions", key: "solutions" },
  { label: "Resources", key: "resources" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// ─── Mega-menu keys that should NOT be replaced by CMS items ─────────
const megaMenuKeys = new Set(["products", "solutions", "resources"]);

function ProductsMegaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[960px] max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-auto max-h-[calc(100vh-5rem)]" style={{ animationDuration: "0.2s" }}>
      <div className="py-8 px-6">
        <div className="grid grid-cols-[240px_1px_1fr] gap-6 xl:grid-cols-[240px_1px_1fr] lg:grid-cols-1">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Platform</div>
            <div className="space-y-1">
              {platformLinks.map((link) => (
                <Link key={link.title} to={link.href} onClick={onClose} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2"><link.icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{link.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{link.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-border hidden xl:block" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Products</div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
              {productCards.map((card) => (
                <Link key={card.title} to={card.href} onClick={onClose} className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="mb-3 rounded-md bg-primary/10 p-2 w-fit"><card.icon className="h-5 w-5 text-primary" /></div>
                  <div className="font-medium text-sm text-foreground mb-1">{card.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{card.desc}</div>
                </Link>
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

function MegaPanel({ links, title, onClose }: { links: typeof solutionLinks; title: string; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[640px] max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in" style={{ animationDuration: "0.2s" }}>
      <div className="py-6 px-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{title}</div>
        <div className="grid grid-cols-2 gap-2">
          {links.map((link) => (
            <Link key={link.title} to={link.href} onClick={onClose} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="mt-0.5 rounded-md bg-primary/10 p-2"><link.icon className="h-5 w-5 text-primary" /></div>
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

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  // Fetch CMS header menu
  const { data: headerMenus } = usePublicMenus("header");

  // Build nav items: keep mega-menu dropdowns, replace/append simple links from CMS
  const navItems = useMemo(() => {
    const megaItems = fallbackNavItems.filter((item) => item.key && megaMenuKeys.has(item.key));

    // Get CMS menu items (first header menu)
    const cmsMenu = headerMenus?.[0];
    if (cmsMenu && cmsMenu.items.length > 0) {
      const cmsLinks = cmsMenu.items
        .filter((item) => !item.parent_id) // top-level only
        .map((item) => ({
          label: item.label,
          href: item.url || "/",
          target: item.target || "_self",
        }));
      return [...megaItems, ...cmsLinks];
    }

    // Fallback to hardcoded items
    return fallbackNavItems;
  }, [headerMenus]);

  const megaMenus: Record<string, typeof solutionLinks> = {
    solutions: solutionLinks,
    resources: resourceLinks,
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
          {navItems.map((item: any) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                target={item.target === "_blank" ? "_blank" : undefined}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
                  location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
                  activeMenu === item.key ? "text-primary" : "text-muted-foreground"
                )}
                onMouseEnter={() => setActiveMenu(item.key!)}
              >
                {item.label}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", activeMenu === item.key && "rotate-180")} />
              </button>
            )
          )}

          {/* Mega menu panels */}
          {activeMenu === "products" && <ProductsMegaPanel onClose={() => setActiveMenu(null)} />}
          {activeMenu && activeMenu !== "products" && megaMenus[activeMenu] && (
            <MegaPanel links={megaMenus[activeMenu]} title={activeMenu === "solutions" ? "Solutions" : "Resources"} onClose={() => setActiveMenu(null)} />
          )}
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
            {navItems.map((item: any) =>
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <details key={item.label} className="group">
                  <summary className="py-2 text-sm font-medium text-foreground cursor-pointer flex items-center justify-between">
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-4 space-y-1 pb-2">
                    {item.key === "products" ? (
                      <>
                        {[...platformLinks, ...productCards].map((link) => (
                          <Link key={link.title} to={link.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-primary">
                            {link.title}
                          </Link>
                        ))}
                      </>
                    ) : (
                      megaMenus[item.key!]?.map((link) => (
                        <Link key={link.title} to={link.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-primary">
                          {link.title}
                        </Link>
                      ))
                    )}
                  </div>
                </details>
              )
            )}
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
