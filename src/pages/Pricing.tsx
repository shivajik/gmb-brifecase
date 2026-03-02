import { CmsPageWrapper } from "@/components/cms/CmsPageWrapper";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

function PricingFallback() {
  return (
    <>
      <PricingPlans />
      <PricingFAQ />
    </>
  );
}

export default function Pricing() {
  return <CmsPageWrapper slug="pricing" fallback={<PricingFallback />} />;
}
