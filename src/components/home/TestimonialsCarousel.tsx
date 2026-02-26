import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const testimonials = [
  { name: "Sarah Johnson", company: "Johnson Dental Group", quote: "GMB Briefcase saved us 15+ hours a week managing our 12 locations. The review monitoring alone is worth it.", rating: 5, avatar: "SJ" },
  { name: "Michael Chen", company: "Bay Area Auto Repair", quote: "We saw a 40% increase in phone calls within the first month. The analytics make it easy to see what's working.", rating: 5, avatar: "MC" },
  { name: "Emily Rodriguez", company: "Fresh Bites Restaurants", quote: "Managing posts and reviews across all our locations used to be a nightmare. Now it's a breeze.", rating: 5, avatar: "ER" },
  { name: "David Kim", company: "Kim Legal Associates", quote: "The competitor analysis feature helped us identify gaps and outrank competing firms in our area.", rating: 5, avatar: "DK" },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[current];

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto max-w-4xl px-4">
        <div className={cn("text-center mb-12 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
        </div>
        <div className={cn("relative bg-card rounded-2xl border border-border p-8 md:p-12 text-center opacity-0", isVisible && "animate-fade-in")} style={{ animationDelay: "200ms" }}>
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(t.rating)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <blockquote className="text-lg md:text-xl text-foreground mb-8 italic leading-relaxed">
            "{t.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {t.avatar}
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">{t.name}</div>
              <div className="text-sm text-muted-foreground">{t.company}</div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="h-9 w-9 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn("h-2 rounded-full transition-all", i === current ? "w-6 bg-primary" : "w-2 bg-border")}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="h-9 w-9 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
