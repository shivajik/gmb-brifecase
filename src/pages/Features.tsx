import { Layout } from "@/components/layout/Layout";
import { CTABanner } from "@/components/home/CTABanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, FileText, BarChart3, Megaphone, CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "gbp",
    icon: MapPin,
    label: "GBP Management",
    title: "Complete Google Business Profile Management",
    desc: "Update business information, photos, services, and attributes across all your locations from one centralized dashboard.",
    bullets: ["Bulk edit business details", "Photo & video management", "Service & product catalogs", "Attribute optimization", "Multi-location support"],
  },
  {
    id: "reviews",
    icon: Star,
    label: "Reviews",
    title: "Review Monitoring & Response",
    desc: "Track reviews from Google, Yelp, Facebook, and 50+ platforms. Respond instantly with AI-powered suggestions.",
    bullets: ["Real-time review alerts", "AI response suggestions", "Sentiment analysis", "Review generation campaigns", "Review widget for your website"],
  },
  {
    id: "listings",
    icon: FileText,
    label: "Listings",
    title: "Listings Management & Sync",
    desc: "Ensure your business information is accurate and consistent across all major directories and platforms.",
    bullets: ["50+ directory submissions", "Automatic sync & updates", "Duplicate suppression", "Citation building", "NAP consistency monitoring"],
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    title: "Advanced Analytics & Reporting",
    desc: "Get detailed insights into how customers find and interact with your business online.",
    bullets: ["Search performance tracking", "Customer action analytics", "Competitor benchmarking", "Custom report builder", "Automated email reports"],
  },
  {
    id: "posts",
    icon: Megaphone,
    label: "Posts",
    title: "Google Posts & Updates",
    desc: "Create, schedule, and publish posts directly to your Google Business Profile to keep your audience engaged.",
    bullets: ["Post scheduling", "Multi-location publishing", "Event & offer posts", "Performance tracking", "Content templates"],
  },
];

export default function Features() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Powerful Features for Local Growth</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage, optimize, and grow your local business presence.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section ref={ref} className="py-20 bg-background">
        <div className={cn("container mx-auto max-w-6xl px-4 opacity-0", isVisible && "animate-fade-in")}>
          <Tabs defaultValue="gbp" className="w-full">
            <TabsList className="flex flex-wrap justify-center h-auto gap-2 bg-transparent mb-12">
              {features.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 rounded-lg">
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {features.map((f, i) => (
              <TabsContent key={f.id} value={f.id}>
                <div className={cn("grid md:grid-cols-2 gap-12 items-center", i % 2 === 1 && "md:[direction:rtl] md:[&>*]:[direction:ltr]")}>
                  <div className="space-y-4">
                    <div className="inline-flex rounded-lg bg-primary/10 p-3">
                      <f.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground">{f.desc}</p>
                    <ul className="space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-foreground">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mock screenshot */}
                  <div className="rounded-xl bg-secondary border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-3 w-3 rounded-full bg-destructive/40" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/40" />
                      <div className="h-3 w-3 rounded-full bg-primary/40" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-muted rounded" />
                        <div className="h-16 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <CTABanner />
    </Layout>
  );
}
