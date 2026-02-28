interface AboutHeroProps {
  title?: string;
  subtitle?: string;
}

export function AboutHero({
  title = "Empowering Local Businesses to Thrive",
  subtitle = "We built GMB Briefcase because local businesses deserve enterprise-level tools without the enterprise-level complexity or cost.",
}: AboutHeroProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
