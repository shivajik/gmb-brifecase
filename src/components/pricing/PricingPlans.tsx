import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PricingPlan {
  name: string;
  monthly: number;
  annual: number;
  desc: string;
  features: unknown[];
  popular?: boolean;
  credits?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: "Business",
    monthly: 99,
    annual: 79,
    desc: "For single & small multi-location businesses",
    features: [
      "No.GMB Listing - 40",
      "GMB Posts - Unlimited",
      "Lead Generator",
      "Reporting Automation",
      "Review Automation",
      "GMB AI Assistant",
      "Geo-Grid Rank Tracking",
      "Website Rank Tracking",
      "Review Generation",
      "Team & Client Access",
      "Local Citation Tracking",
      "Competitor Tracking",
      { text: "White Label Subdomain", muted: true },
    ],
    popular: false,
    credits: "GeoGrid - Rank tracking & Lead Generation - 5000 Credits",
  },
  {
    name: "Pro",
    monthly: 199,
    annual: 159,
    desc: "Ideal for growing agencies & businesses",
    features: [
      "No.GMB Listing - 100",
      "GMB Posts - Unlimited",
      "Lead Generator",
      "Reporting Automation",
      "Review Automation",
      "GMB AI Assistant",
      "Geo-Grid Rank Tracking",
      "Website Rank Tracking",
      "Review Generation",
      "Team & Client Access",
      "Local Citation Tracking",
      "Competitor Tracking",
      "White Label Subdomain",
    ],
    popular: true,
    credits: "GeoGrid - Rank tracking & Lead Generation - 10000 Credits",
  },
  {
    name: "Agency",
    monthly: 299,
    annual: 239,
    desc: "For agencies & multi-location brands",
    features: [
      "No.GMB Listing - 200",
      "GMB Posts - Unlimited",
      "Lead Generator",
      "Reporting Automation",
      "Review Automation",
      "GMB AI Assistant",
      "Geo-Grid Rank Tracking",
      "Website Rank Tracking",
      "Review Generation",
      "Team & Client Access",
      "Local Citation Tracking",
      "Competitor Tracking",
      "White Label Subdomain",
    ],
    popular: false,
    credits: "GeoGrid - Rank tracking & Lead Generation - 20000 Credits",
  },
];

interface PricingPlansProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
}

interface FeatureItem {
  text: string;
  muted?: boolean;
}

function normalizeFeatures(features: unknown[]): FeatureItem[] {
  return features
    .map((feature) => {
      if (typeof feature === "string") return { text: feature };
      if (feature && typeof feature === "object" && "text" in feature && typeof (feature as { text?: unknown }).text === "string") {
        return { text: (feature as { text: string }).text, muted: !!(feature as { muted?: boolean }).muted };
      }
      return null;
    })
    .filter(Boolean) as FeatureItem[];
}

function toPrice(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PricingPlans({
  title = "Simple, Transparent Pricing",
  subtitle = "Start free. Scale as you grow. No hidden fees.",
  plans,
}: PricingPlansProps) {
  const [annual, setAnnual] = useState(false);

  const displayPlans = (Array.isArray(plans) && plans.length > 0 ? plans : DEFAULT_PLANS).map((plan) => ({
    ...plan,
    features: normalizeFeatures(Array.isArray(plan.features) ? plan.features : []),
    popular: Boolean(plan.popular),
  }));

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

        <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1 mb-12">
          <button onClick={() => setAnnual(false)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            Monthly
          </button>
          <button onClick={() => setAnnual(true)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", annual ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            Annual <span className="text-xs opacity-80">Save 20%</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {displayPlans.map((plan) => {
            const price = annual ? toPrice(plan.annual) : toPrice(plan.monthly);
            return (
              <div key={plan.name} className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-8 text-left transition-all hover:shadow-lg",
                plan.popular ? "border-primary border-2 shadow-lg md:scale-105 z-10" : "border-border"
              )}>
                {/* Plan name */}
                <h3 className={cn(
                  "text-xl font-bold text-center mb-4",
                  plan.popular ? "text-primary" : "text-card-foreground"
                )}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground text-base">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={`${plan.name}-${feature.text}`} className="flex items-center gap-2.5 text-sm">
                      <Check className={cn(
                        "h-4 w-4 shrink-0",
                        feature.muted ? "text-muted-foreground/50" : "text-primary"
                      )} />
                      <span className={cn(
                        plan.popular ? "font-semibold text-foreground" : "text-foreground",
                        feature.muted && "text-muted-foreground italic"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={cn("w-full rounded-full py-5 text-base font-semibold")}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/contact">Purchase now</Link>
                </Button>

                {/* Credits info */}
                {plan.credits && (
                  <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                    You will get following monthly credits:<br />
                    <span className="font-medium">{plan.credits}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}