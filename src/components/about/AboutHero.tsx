import { THEME } from "@/config/themeSettings";

interface AboutHeroProps {
  title?: string;
  subtitle?: string;
}

export function AboutHero({
  title = "Empowering Local Businesses to Thrive",
  subtitle = "We built GMB Briefcase because local businesses deserve enterprise-level tools without the enterprise-level complexity or cost.",
}: AboutHeroProps) {
  return (
    <section className={`${THEME.heroPadding} ${THEME.heroGradient}`}>
      <div className={THEME.heroContainer}>
        <h1 className={THEME.heroHeading}>{title}</h1>
        <p className={THEME.heroSubtitle}>{subtitle}</p>
      </div>
    </section>
  );
}
