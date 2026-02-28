import { CmsPageWrapper } from "@/components/cms/CmsPageWrapper";
import { HeroSection } from "@/components/home/HeroSection";
import { LogoTicker } from "@/components/home/LogoTicker";
import { FeaturesCarousel } from "@/components/home/FeaturesCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BenefitsGrid } from "@/components/home/BenefitsGrid";
import { ProductScreenshot } from "@/components/home/ProductScreenshot";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { StatsBar } from "@/components/home/StatsBar";
import { CTABanner } from "@/components/home/CTABanner";

const HomeFallback = () => (
  <>
    <HeroSection />
    <LogoTicker />
    <FeaturesCarousel />
    <HowItWorks />
    <BenefitsGrid />
    <ProductScreenshot />
    <TestimonialsCarousel />
    <StatsBar />
    <CTABanner />
  </>
);

const Index = () => (
  <CmsPageWrapper slug="home" fallback={<HomeFallback />} />
);

export default Index;
