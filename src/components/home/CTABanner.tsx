import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

export function CTABanner() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-primary via-primary to-primary/80">
      <div className={cn("container mx-auto max-w-4xl px-4 text-center opacity-0", isVisible && "animate-fade-in")}>
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Grow Your Business?
        </h2>
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Join 10,000+ businesses already using GMB Briefcase to dominate local search.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" variant="secondary" asChild className="text-base font-semibold">
            <Link to="/pricing">
              Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
