import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

const stats = [
  { value: 10000, suffix: "+", label: "Businesses" },
  { value: 5, suffix: "M+", label: "Reviews Managed" },
  { value: 50, suffix: "+", label: "Integrations" },
  { value: 99, suffix: "%", label: "Uptime" },
];

function StatItem({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 2000, start);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary-foreground">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-primary-foreground/70 mt-1">{label}</div>
    </div>
  );
}

export function StatsBar() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className={cn("py-16 bg-primary")}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} start={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
