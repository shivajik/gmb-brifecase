import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const plans = [
  {
    name: "Starter",
    monthly: 49,
    annual: 39,
    desc: "Perfect for single-location businesses",
    features: ["1 Location", "GBP Management", "Review Monitoring", "Basic Analytics", "Email Support", "Monthly Reports"],
    popular: false,
  },
  {
    name: "Professional",
    monthly: 99,
    annual: 79,
    desc: "Ideal for growing businesses & small agencies",
    features: ["Up to 10 Locations", "Everything in Starter", "Listings Management", "AI Review Responses", "Competitor Analysis", "Priority Support", "Custom Reports"],
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: 249,
    annual: 199,
    desc: "For agencies & multi-location brands",
    features: ["Unlimited Locations", "Everything in Professional", "White-Label Reports", "API Access", "Dedicated Account Manager", "Custom Integrations", "SLA Guarantee"],
    popular: false,
  },
];

const faqs = [
  { q: "Can I try GMB Briefcase for free?", a: "Yes! All plans come with a 14-day free trial. No credit card required." },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your dashboard." },
  { q: "What happens after my trial ends?", a: "You'll be prompted to choose a plan. Your data and settings are preserved." },
  { q: "Do you offer discounts for agencies?", a: "Yes, we offer volume discounts for agencies managing 20+ locations. Contact our sales team." },
  { q: "Is there a setup fee?", a: "No setup fees. You can be up and running in minutes." },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground mb-8">Start free. Scale as you grow. No hidden fees.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1 mb-12">
            <button onClick={() => setAnnual(false)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", annual ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              Annual <span className="text-xs opacity-80">Save 20%</span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={cn(
                "relative rounded-2xl border bg-card p-8 text-left transition-all hover:shadow-lg",
                plan.popular ? "border-primary shadow-md scale-105" : "border-border"
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">${annual ? plan.annual : plan.monthly}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <Button className="w-full mb-6" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">Start Free Trial</Link>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={ref} className="py-20 bg-background">
        <div className={cn("container mx-auto max-w-3xl px-4 opacity-0", isVisible && "animate-fade-in")}>
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
}
