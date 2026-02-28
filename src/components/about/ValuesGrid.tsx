import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Target, Heart, Zap, Shield, Users, Globe } from "lucide-react";

const values = [
  { icon: Target, title: "Customer-First", desc: "Every decision starts with how it impacts our users." },
  { icon: Heart, title: "Transparency", desc: "No hidden fees, no lock-in. We earn your trust every day." },
  { icon: Zap, title: "Innovation", desc: "We push boundaries with AI and automation to save you time." },
  { icon: Shield, title: "Reliability", desc: "99.9% uptime. Your business depends on us and we don't take that lightly." },
  { icon: Users, title: "Community", desc: "We grow together — sharing insights, strategies, and support." },
  { icon: Globe, title: "Impact", desc: "Empowering local businesses to compete and thrive globally." },
];

interface ValuesGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export function ValuesGrid({
  sectionTitle = "Our Values",
  sectionSubtitle = "What drives everything we do.",
}: ValuesGridProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className={cn("text-center mb-12 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl font-bold text-foreground mb-4">{sectionTitle}</h2>
          <p className="text-muted-foreground">{sectionSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={v.title}
              className={cn("rounded-xl border border-border bg-card p-6 opacity-0", isVisible && "animate-fade-in")}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
