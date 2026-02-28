-- Features: replace heading+paragraph with FeaturesHero component
UPDATE pages SET content = '[
  {"id":"hero","type":"component","data":{"component":"FeaturesHero"}},
  {"id":"tabs","type":"component","data":{"component":"FeatureTabs"}},
  {"id":"cta","type":"component","data":{"component":"CTABanner"}}
]'::jsonb WHERE slug = 'features';

-- Pricing: remove heading+paragraph (already in PricingPlans component)
UPDATE pages SET content = '[
  {"id":"plans","type":"component","data":{"component":"PricingPlans"}},
  {"id":"faq","type":"component","data":{"component":"PricingFAQ"}}
]'::jsonb WHERE slug = 'pricing';

-- About: replace heading+paragraph with AboutHero component
UPDATE pages SET content = '[
  {"id":"hero","type":"component","data":{"component":"AboutHero"}},
  {"id":"values","type":"component","data":{"component":"ValuesGrid"}},
  {"id":"stats","type":"component","data":{"component":"StatsBar"}},
  {"id":"cta","type":"component","data":{"component":"CTABanner"}}
]'::jsonb WHERE slug = 'about';