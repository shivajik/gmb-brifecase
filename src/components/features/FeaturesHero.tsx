interface FeaturesHeroProps {
  title?: string;
  subtitle?: string;
}

export function FeaturesHero({
  title = "Powerful Features for Local Growth",
  subtitle = "Everything you need to manage, optimize, and grow your local business presence.",
}: FeaturesHeroProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
