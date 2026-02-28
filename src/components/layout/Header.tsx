import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicMenus, buildMenuTree, type PublicMenuItem } from "@/hooks/usePublicMenus";
import { getIconComponent } from "@/components/layout/headerIcons";

// ─── Hardcoded fallback nav items ────────────────────────────────────
const fallbackNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavItem {
  label: string;
  href?: string;
  target?: string;
  icon?: string | null;
  description?: string | null;
  children?: NavItem[];
}

function buildNavItems(items: PublicMenuItem[]): NavItem[] {
  const tree = buildMenuTree(items);
  return tree.map((node) => {
    const hasChildren = (node as any).children?.length > 0;
    return {
      label: node.label,
      href: hasChildren ? undefined : (node.url || "/"),
      target: node.target || "_self",
      icon: node.icon,
      description: node.description,
      children: hasChildren
        ? (node as any).children.map((c: PublicMenuItem) => ({
            label: c.label,
            href: c.url || "/",
            target: c.target || "_self",
            icon: c.icon,
            description: c.description,
          }))
        : undefined,
    };
  });
}

// ─── Mega Menu Panel ─────────────────────────────────────────────────
function MegaPanel({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const children = item.children || [];
  const hasDescriptions = children.some((c) => c.description);
  const colCount = children.length > 4 ? 3 : 2;

  return (
    <div
      className="absolute left-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-auto max-h-[calc(100vh-5rem)]"
      style={{ animationDuration: "0.2s", width: hasDescriptions ? "640px" : "320px", maxWidth: "calc(100vw - 2rem)" }}
    >
      <div className="py-6 px-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {item.label}
        </div>
        <div className={cn("grid gap-2", hasDescriptions ? `grid-cols-${colCount}` : "grid-cols-1")}
             style={{ gridTemplateColumns: hasDescriptions ? `repeat(${colCount}, minmax(0, 1fr))` : undefined }}>
          {children.map((child) => {
            const Icon = getIconComponent(child.icon);
            return (
              <Link
                key={child.label}
                to={child.href || "/"}
                target={child.target === "_blank" ? "_blank" : undefined}
                onClick={onClose}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-accent",
                  hasDescriptions && "border border-border bg-card hover:border-primary/30 hover:shadow-md p-4"
                )}
              >
                {Icon && (
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm text-foreground">{child.label}</div>
                  {child.description && (
                    <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{child.description}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  const { data: headerMenus } = usePublicMenus("header");

  const navItems = useMemo(() => {
    const cmsMenu = headerMenus?.[0];
    if (cmsMenu && cmsMenu.items.length > 0) {
      return buildNavItems(cmsMenu.items);
    }
    return fallbackNavItems;
  }, [headerMenus]);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            {(() => { const I = getIconComponent("MapPin"); return I ? <I className="h-5 w-5 text-primary-foreground" /> : null; })()}
          </div>
          <span>GMB Briefcase</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 relative">
          {navItems.map((item) =>
            item.children ? (
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
            )
          )}

          {/* Mega menu panels */}
          {activeMenu && navItems.find((i) => i.label === activeMenu && i.children) && (
            <MegaPanel
              item={navItems.find((i) => i.label === activeMenu)!}
              onClose={() => setActiveMenu(null)}
            />
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
            {navItems.map((item) =>
              item.children ? (
                <details key={item.label} className="group">
                  <summary className="py-2 text-sm font-medium text-foreground cursor-pointer flex items-center justify-between">
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-4 space-y-1 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href || "/"}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                      >
                        {child.label}
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
