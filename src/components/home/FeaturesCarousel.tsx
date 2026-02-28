import { MapPin, Star, BarChart3, Megaphone, FileText } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const features = [
  { icon: MapPin, title: "GBP Management", desc: "Update info, photos, and attributes across all locations from one dashboard." },
  { icon: Star, title: "Review Monitoring", desc: "Track, respond to, and analyze reviews from Google and 50+ platforms." },
  { icon: FileText, title: "Listings Management", desc: "Ensure consistent NAP data across all major directories." },
  { icon: BarChart3, title: "Analytics & Insights", desc: "Track profile views, search queries, and customer actions in real-time." },
  { icon: Megaphone, title: "Posts & Updates", desc: "Schedule and publish posts directly to your Google Business Profile." },
];

interface FeaturesCarouselProps {
  title?: string;
  subtitle?: string;
}

export function FeaturesCarousel({
  title = "Everything You Need to Dominate Local Search",
  subtitle = "A complete suite of tools to manage your online presence and grow your business.",
}: FeaturesCarouselProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className={cn("text-center mb-12 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                "group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover-scale opacity-0",
                isVisible && "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
