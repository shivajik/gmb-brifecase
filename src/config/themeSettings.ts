/**
 * Global theme settings — single source of truth for site-wide styling.
 * Used by CmsBlockRenderer and hardcoded hero components alike.
 */
export const THEME = {
  /** Hero section gradient (first h1 on a page) */
  heroGradient: "bg-gradient-to-br from-secondary via-background to-accent",

  /** Hero section padding */
  heroPadding: "py-20",

  /** Hero container classes */
  heroContainer: "container mx-auto max-w-4xl px-4 text-center",

  /** Hero h1 typography */
  heroHeading: "text-4xl md:text-5xl font-bold text-foreground mb-4",

  /** Hero subtitle (paragraph right after hero h1) */
  heroSubtitle: "text-lg text-muted-foreground max-w-2xl mx-auto",

  /** Default section padding */
  sectionPadding: "py-12",

  /** Alternating section backgrounds */
  sectionBg: ["bg-background", "bg-muted/30"] as const,

  /** Container for inline content blocks */
  contentContainer: "container mx-auto max-w-4xl px-4 space-y-4",

  /** Per-level heading styles */
  headingStyles: {
    h1: "text-4xl md:text-5xl font-bold text-foreground",
    h2: "text-3xl font-bold text-foreground",
    h3: "text-2xl font-semibold text-foreground",
    h4: "text-xl font-semibold text-foreground",
    h5: "text-lg font-medium text-foreground",
    h6: "text-base font-medium text-foreground",
  } as Record<string, string>,

  /** Section heading (h2 used as section divider) */
  sectionHeading: "text-3xl font-bold text-foreground mb-4 text-center",

  /** Section subtitle */
  sectionSubtitle: "text-muted-foreground text-center",
} as const;
