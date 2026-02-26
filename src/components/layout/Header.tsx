import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BarChart3, Star, MapPin, FileText, Megaphone, Users, BookOpen, HelpCircle, Building2, ShoppingBag, Stethoscope, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const productLinks = [
  { icon: MapPin, title: "GBP Management", desc: "Manage your Google Business Profiles", href: "/features" },
  { icon: Star, title: "Review Monitoring", desc: "Track and respond to reviews", href: "/features" },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Insights to grow your business", href: "/features" },
  { icon: Megaphone, title: "Posts & Updates", desc: "Publish directly to Google", href: "/features" },
  { icon: FileText, title: "Listings Management", desc: "Keep your info consistent everywhere", href: "/features" },
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

function MegaPanel({ links, onClose }: { links: typeof productLinks; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full w-screen bg-popover border-b border-border shadow-lg z-50 animate-fade-in" style={{ animationDuration: "0.2s" }}>
      <div className="container mx-auto max-w-6xl py-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {links.map((link) => (
            <Link
              key={link.title}
              to={link.href}
              onClick={onClose}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
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

  const navItems = [
    { label: "Products", key: "products" },
    { label: "Solutions", key: "solutions" },
    { label: "Resources", key: "resources" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
  ];

  const megaMenus: Record<string, typeof productLinks> = {
    products: productLinks,
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
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
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

      {/* Mega menu panels */}
      {activeMenu && megaMenus[activeMenu] && (
        <MegaPanel links={megaMenus[activeMenu]} onClose={() => setActiveMenu(null)} />
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) =>
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
                    {megaMenus[item.key!]?.map((link) => (
                      <Link
                        key={link.title}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                      >
                        {link.title}
                      </Link>
                    ))}
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
