import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star, Phone, Eye, TrendingUp } from "lucide-react";

export function ProductScreenshot() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 bg-secondary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className={cn("text-center mb-12 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Command Center for Local Marketing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See everything at a glance — from reviews and rankings to posts and performance.
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className={cn("rounded-2xl bg-card border border-border shadow-2xl p-8 opacity-0", isVisible && "animate-fade-in")} style={{ animationDelay: "200ms" }}>
            {/* Mock UI */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <div className="ml-4 flex-1 h-6 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Reviews", value: "2,847", icon: Star },
                { label: "Avg Rating", value: "4.8", icon: Star },
                { label: "Phone Calls", value: "1,234", icon: Phone },
                { label: "Profile Views", value: "45.2K", icon: Eye },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-secondary p-4 text-center">
                  <s.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="h-40 rounded-lg bg-gradient-to-t from-primary/10 to-transparent flex items-end gap-1 px-4 pb-2">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/50" style={{ height: `${30 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%` }} />
              ))}
            </div>
          </div>

          {/* Floating stat cards */}
          {isVisible && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                transition={{ delay: 0.5, duration: 0.4, y: { repeat: Infinity, duration: 3 } }}
                className="absolute -top-6 -right-6 rounded-xl bg-card border border-border shadow-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-bold text-card-foreground">+32% Visibility</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, 6, 0] }}
                transition={{ delay: 0.7, duration: 0.4, y: { repeat: Infinity, duration: 3.5 } }}
                className="absolute -bottom-6 -left-6 rounded-xl bg-card border border-border shadow-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold text-card-foreground">4.8★ Average</span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
