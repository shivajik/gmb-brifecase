import { THEME } from "@/config/themeSettings";

interface FeaturesHeroProps {
  title?: string;
  subtitle?: string;
}

export function FeaturesHero({
  title = "Powerful Features for Local Growth",
  subtitle = "Everything you need to manage, optimize, and grow your local business presence.",
}: FeaturesHeroProps) {
  return (
    <section className={`${THEME.heroPadding} ${THEME.heroGradient}`}>
      <div className={THEME.heroContainer}>
        <h1 className={THEME.heroHeading}>{title}</h1>
        <p className={THEME.heroSubtitle}>{subtitle}</p>
      </div>
    </section>
  );
}
