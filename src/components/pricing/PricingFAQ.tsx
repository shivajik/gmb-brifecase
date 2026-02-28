import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "Can I try GMB Briefcase for free?", a: "Yes! All plans come with a 14-day free trial. No credit card required." },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your dashboard." },
  { q: "What happens after my trial ends?", a: "You'll be prompted to choose a plan. Your data and settings are preserved." },
  { q: "Do you offer discounts for agencies?", a: "Yes, we offer volume discounts for agencies managing 20+ locations. Contact our sales team." },
  { q: "Is there a setup fee?", a: "No setup fees. You can be up and running in minutes." },
];

export function PricingFAQ() {
  const { ref, isVisible } = useScrollAnimation();

  return (
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
  );
}
