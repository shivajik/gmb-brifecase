import { type ComponentType } from "react";

// Home page components
import { HeroSection } from "@/components/home/HeroSection";
import { LogoTicker } from "@/components/home/LogoTicker";
import { FeaturesCarousel } from "@/components/home/FeaturesCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BenefitsGrid } from "@/components/home/BenefitsGrid";
import { ProductScreenshot } from "@/components/home/ProductScreenshot";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { StatsBar } from "@/components/home/StatsBar";
import { CTABanner } from "@/components/home/CTABanner";

// Features page components
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { FeatureTabs } from "@/components/features/FeatureTabs";

// Pricing page components
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

// About page components
import { AboutHero } from "@/components/about/AboutHero";
import { ValuesGrid } from "@/components/about/ValuesGrid";

// Contact page components
import { ContactForm, ContactInfo } from "@/components/contact/ContactSection";

const COMPONENT_REGISTRY: Record<string, ComponentType<any>> = {
  // Home
  HeroSection,
  LogoTicker,
  FeaturesCarousel,
  HowItWorks,
  BenefitsGrid,
  ProductScreenshot,
  TestimonialsCarousel,
  StatsBar,
  CTABanner,
  // Features
  FeaturesHero,
  FeatureTabs,
  // Pricing
  PricingPlans,
  PricingFAQ,
  // About
  AboutHero,
  ValuesGrid,
  // Contact
  ContactForm,
  ContactInfo,
};

export function getRegisteredComponent(name: string): ComponentType<any> | null {
  return COMPONENT_REGISTRY[name] ?? null;
}

export default COMPONENT_REGISTRY;
