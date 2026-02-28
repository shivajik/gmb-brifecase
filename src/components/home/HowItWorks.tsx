import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { UserPlus, Settings, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Connect Your Profiles", desc: "Link your Google Business Profiles in seconds. We support unlimited locations." },
  { icon: Settings, title: "Optimize & Manage", desc: "Update business info, respond to reviews, publish posts, and fix listings — all in one place." },
  { icon: TrendingUp, title: "Grow & Track Results", desc: "Watch your visibility climb with detailed analytics and actionable insights." },
];

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
}

export function HowItWorks({
  title = "How It Works",
  subtitle = "Get started in minutes with three simple steps.",
}: HowItWorksProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-secondary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className={cn("text-center mb-14 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-0.5 bg-border" />
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={cn("relative text-center opacity-0", isVisible && "animate-fade-in")}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="relative mx-auto mb-6 h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg z-10">
                {i + 1}
              </div>
              <step.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
