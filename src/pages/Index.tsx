import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { LogoTicker } from "@/components/home/LogoTicker";
import { FeaturesCarousel } from "@/components/home/FeaturesCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BenefitsGrid } from "@/components/home/BenefitsGrid";
import { ProductScreenshot } from "@/components/home/ProductScreenshot";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { StatsBar } from "@/components/home/StatsBar";
import { CTABanner } from "@/components/home/CTABanner";

const Index = () => (
  <Layout>
    <HeroSection />
    <LogoTicker />
    <FeaturesCarousel />
    <HowItWorks />
    <BenefitsGrid />
    <ProductScreenshot />
    <TestimonialsCarousel />
    <StatsBar />
    <CTABanner />
  </Layout>
);

export default Index;
