import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, MessageSquare, Building2, Brain, Search } from "lucide-react";

const benefits = [
  { icon: Clock, title: "Save Time", desc: "Manage all locations from a single dashboard. No more switching tabs." },
  { icon: TrendingUp, title: "Boost Rankings", desc: "Optimize your profiles to rank higher in local search results." },
  { icon: MessageSquare, title: "Manage Reviews", desc: "Monitor and respond to reviews across 50+ platforms instantly." },
  { icon: Building2, title: "Multi-Location Support", desc: "Scale effortlessly whether you have 1 or 1,000 locations." },
  { icon: Brain, title: "AI-Powered Insights", desc: "Get smart recommendations to improve your local presence." },
  { icon: Search, title: "Competitor Analysis", desc: "See how you stack up against competitors in your area." },
];

export function BenefitsGrid() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className={cn("text-center mb-12 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose GMB Briefcase?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for agencies and businesses that take local marketing seriously.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={cn(
                "rounded-xl border border-border bg-card p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 opacity-0",
                isVisible && "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
