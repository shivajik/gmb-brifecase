import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
}

export function HeroSection({
  badge = "Trusted by 10,000+ businesses",
  title,
  subtitle = "Optimize your Google Business Profile, monitor reviews, manage listings, and get actionable insights — all from one powerful dashboard.",
  ctaPrimaryText = "Start Free Trial",
  ctaPrimaryLink = "/pricing",
  ctaSecondaryText = "Book a Demo",
  ctaSecondaryLink = "/contact",
}: HeroSectionProps) {
  const titleContent = title || (
    <>The All-in-One Platform to{" "}<span className="text-primary">Manage & Grow</span> Your Local Business</>
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-accent py-20 lg:py-28">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              {badge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              {titleContent}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="text-base">
                <Link to={ctaPrimaryLink}>
                  {ctaPrimaryText} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base">
                <Link to={ctaSecondaryLink}>{ctaSecondaryText}</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>10,000+ users</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl bg-card border border-border shadow-2xl p-6 mx-auto max-w-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-card-foreground">Dashboard Overview</div>
                  <div className="text-xs text-muted-foreground">Last 30 days</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Profile Views", value: "12.4K", change: "+18%" },
                    { label: "Search Queries", value: "8.2K", change: "+24%" },
                    { label: "Customer Actions", value: "3.1K", change: "+12%" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-secondary p-3">
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-primary font-medium">{stat.change}</div>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-end px-3 pb-3 gap-1">
                  {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/60" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-4 -right-4 rounded-xl bg-card border border-border shadow-lg p-3"
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <div>
                  <div className="text-sm font-bold text-card-foreground">4.8★</div>
                  <div className="text-[10px] text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5 }}
              className="absolute -bottom-4 -left-4 rounded-xl bg-card border border-border shadow-lg p-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-primary rotate-[-45deg]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-card-foreground">+32%</div>
                  <div className="text-[10px] text-muted-foreground">More Calls</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
