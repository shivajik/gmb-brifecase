/**
 * Defines the editable prop schemas for each CMS-registered component.
 * Each schema entry describes the fields that can be edited inline in the page editor.
 */

export type PropFieldType = "text" | "textarea" | "number" | "url" | "array";

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  placeholder?: string;
  /** For "array" type: defines the shape of each item */
  itemFields?: PropField[];
}

export interface ComponentPropSchema {
  /** Human-readable label shown in the editor */
  label: string;
  fields: PropField[];
}

const COMPONENT_PROP_SCHEMAS: Record<string, ComponentPropSchema> = {
  // ─── Home ───────────────────────────────────────────────
  HeroSection: {
    label: "Hero Section",
    fields: [
      { key: "badge", label: "Badge Text", type: "text", placeholder: "Trusted by 10,000+ businesses" },
      { key: "title", label: "Title", type: "textarea", placeholder: "The All-in-One Platform to..." },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Optimize your Google Business Profile..." },
      { key: "ctaPrimaryText", label: "Primary CTA Text", type: "text", placeholder: "Start Free Trial" },
      { key: "ctaPrimaryLink", label: "Primary CTA Link", type: "text", placeholder: "/pricing" },
      { key: "ctaSecondaryText", label: "Secondary CTA Text", type: "text", placeholder: "Book a Demo" },
      { key: "ctaSecondaryLink", label: "Secondary CTA Link", type: "text", placeholder: "/contact" },
    ],
  },

  LogoTicker: {
    label: "Logo Ticker",
    fields: [
      { key: "heading", label: "Heading Text", type: "text", placeholder: "Trusted by businesses managing their presence on" },
    ],
  },

  FeaturesCarousel: {
    label: "Features Carousel",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "Everything You Need to Dominate Local Search" },
      { key: "subtitle", label: "Section Subtitle", type: "textarea", placeholder: "A complete suite of tools..." },
    ],
  },

  HowItWorks: {
    label: "How It Works",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "How It Works" },
      { key: "subtitle", label: "Section Subtitle", type: "text", placeholder: "Get started in minutes with three simple steps." },
    ],
  },

  BenefitsGrid: {
    label: "Benefits Grid",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "Why Choose GMB Briefcase?" },
      { key: "subtitle", label: "Section Subtitle", type: "textarea", placeholder: "Built for agencies and businesses..." },
    ],
  },

  ProductScreenshot: {
    label: "Product Screenshot",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "Your Command Center for Local Marketing" },
      { key: "subtitle", label: "Section Subtitle", type: "textarea", placeholder: "See everything at a glance..." },
    ],
  },

  TestimonialsCarousel: {
    label: "Testimonials Carousel",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "What Our Customers Say" },
    ],
  },

  StatsBar: {
    label: "Stats Bar",
    fields: [
      { key: "stats", label: "Statistics", type: "array", itemFields: [
        { key: "value", label: "Value", type: "number", placeholder: "10000" },
        { key: "suffix", label: "Suffix", type: "text", placeholder: "+" },
        { key: "label", label: "Label", type: "text", placeholder: "Businesses" },
      ]},
    ],
  },

  CTABanner: {
    label: "CTA Banner",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Ready to Grow Your Business?" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Join 10,000+ businesses..." },
      { key: "ctaPrimaryText", label: "Primary CTA Text", type: "text", placeholder: "Start Free Trial" },
      { key: "ctaPrimaryLink", label: "Primary CTA Link", type: "text", placeholder: "/pricing" },
      { key: "ctaSecondaryText", label: "Secondary CTA Text", type: "text", placeholder: "Talk to Sales" },
      { key: "ctaSecondaryLink", label: "Secondary CTA Link", type: "text", placeholder: "/contact" },
    ],
  },

  // ─── Features ───────────────────────────────────────────
  FeaturesHero: {
    label: "Features Hero",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Powerful Features for Local Growth" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Everything you need to manage..." },
    ],
  },

  FeatureTabs: {
    label: "Feature Tabs",
    fields: [],
  },

  // ─── Pricing ────────────────────────────────────────────
  PricingPlans: {
    label: "Pricing Plans",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Simple, Transparent Pricing" },
      { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Start free. Scale as you grow. No hidden fees." },
    ],
  },

  PricingFAQ: {
    label: "Pricing FAQ",
    fields: [
      { key: "title", label: "Section Title", type: "text", placeholder: "Frequently Asked Questions" },
    ],
  },

  // ─── About ─────────────────────────────────────────────
  AboutHero: {
    label: "About Hero",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Empowering Local Businesses to Thrive" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "We built GMB Briefcase because..." },
    ],
  },

  ValuesGrid: {
    label: "Values Grid",
    fields: [
      { key: "sectionTitle", label: "Section Title", type: "text", placeholder: "Our Values" },
      { key: "sectionSubtitle", label: "Section Subtitle", type: "text", placeholder: "What drives everything we do." },
    ],
  },

  // ─── Contact ────────────────────────────────────────────
  ContactForm: {
    label: "Contact Form",
    fields: [
      { key: "title", label: "Page Title", type: "text", placeholder: "Get in Touch" },
      { key: "subtitle", label: "Page Subtitle", type: "textarea", placeholder: "Have a question or want to see a demo?" },
      { key: "formTitle", label: "Form Title", type: "text", placeholder: "Send us a message" },
      { key: "buttonText", label: "Button Text", type: "text", placeholder: "Send Message" },
    ],
  },

  ContactInfo: {
    label: "Contact Info",
    fields: [
      { key: "email", label: "Email", type: "text", placeholder: "hello@gmbbriefcase.com" },
      { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 123-4567" },
      { key: "address", label: "Address", type: "textarea", placeholder: "123 Business Ave..." },
      { key: "hours", label: "Hours", type: "text", placeholder: "Mon-Fri: 9AM - 6PM PST" },
      { key: "demoTitle", label: "Demo Box Title", type: "text", placeholder: "Book a Demo" },
      { key: "demoSubtitle", label: "Demo Box Subtitle", type: "text", placeholder: "See GMB Briefcase in action..." },
    ],
  },
};

export function getComponentSchema(name: string): ComponentPropSchema | null {
  return COMPONENT_PROP_SCHEMAS[name] ?? null;
}

export default COMPONENT_PROP_SCHEMAS;
