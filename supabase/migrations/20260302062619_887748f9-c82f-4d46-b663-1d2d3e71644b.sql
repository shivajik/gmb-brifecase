
-- Populate all page component props with defaults (matching contact page pattern)

-- HOME page: populate all component props
UPDATE public.pages SET content = '[
  {"id":"hero","type":"component","data":{"component":"HeroSection","badge":"Loved by 25,000+ local businesses","title":"The All-in-One Platform to Manage & Grow Your Local Business","subtitle":"Optimize your Google Business Profile, monitor reviews, manage listings, and get actionable insights — all from one powerful dashboard.","ctaPrimaryText":"Start Free Trial","ctaPrimaryLink":"/pricing","ctaSecondaryText":"Book a Demo","ctaSecondaryLink":"/contact"}},
  {"id":"logos","type":"component","data":{"component":"LogoTicker","heading":"Trusted by businesses managing their presence on"}},
  {"id":"features","type":"component","data":{"component":"FeaturesCarousel","title":"Everything You Need to Dominate Local Search","subtitle":"A complete suite of tools to manage your online presence and grow your business."}},
  {"id":"howitworks","type":"component","data":{"component":"HowItWorks","title":"How It Works","subtitle":"Get started in minutes with three simple steps."}},
  {"id":"benefits","type":"component","data":{"component":"BenefitsGrid","title":"Why Choose GMB Briefcase?","subtitle":"Built for agencies and businesses that take local marketing seriously."}},
  {"id":"screenshot","type":"component","data":{"component":"ProductScreenshot","title":"Your Command Center for Local Marketing","subtitle":"See everything at a glance — from reviews and rankings to posts and performance."}},
  {"id":"testimonials","type":"component","data":{"component":"TestimonialsCarousel","title":"What Our Customers Say"}},
  {"id":"stats","type":"component","data":{"component":"StatsBar","stats":[{"value":10000,"suffix":"+","label":"Businesses"},{"value":5,"suffix":"M+","label":"Reviews Managed"},{"value":50,"suffix":"+","label":"Integrations"},{"value":99,"suffix":"%","label":"Uptime"}]}},
  {"id":"cta","type":"component","data":{"component":"CTABanner","title":"Take Your Business to the Next Level","subtitle":"Join 10,000+ businesses already using GMB Briefcase to dominate local search.","ctaPrimaryText":"Start Free Trial","ctaPrimaryLink":"/pricing","ctaSecondaryText":"Talk to Sales","ctaSecondaryLink":"/contact"}}
]'::jsonb
WHERE slug = 'home';

-- FEATURES page
UPDATE public.pages SET content = '[
  {"id":"hero","type":"component","data":{"component":"FeaturesHero","title":"Powerful Features for Local Growth","subtitle":"Everything you need to manage, optimize, and grow your local business presence."}},
  {"id":"tabs","type":"component","data":{"component":"FeatureTabs"}},
  {"id":"cta","type":"component","data":{"component":"CTABanner","title":"Ready to Grow Your Business?","subtitle":"Join 10,000+ businesses already using GMB Briefcase to dominate local search.","ctaPrimaryText":"Start Free Trial","ctaPrimaryLink":"/pricing","ctaSecondaryText":"Talk to Sales","ctaSecondaryLink":"/contact"}}
]'::jsonb
WHERE slug = 'features';

-- PRICING page: populate plans and FAQs
UPDATE public.pages SET content = '[
  {"id":"plans","type":"component","data":{"component":"PricingPlans","title":"Simple, Transparent Pricing","subtitle":"Plans that grow with your business. No surprises.","plans":[{"name":"Starter","monthly":49,"annual":39,"desc":"Perfect for single-location businesses","popular":false,"features":[{"text":"1 Location"},{"text":"GBP Management"},{"text":"Review Monitoring"},{"text":"Basic Analytics"},{"text":"Email Support"},{"text":"Monthly Reports"}]},{"name":"Professional","monthly":99,"annual":79,"desc":"Ideal for growing businesses & small agencies","popular":true,"features":[{"text":"Up to 10 Locations"},{"text":"Everything in Starter"},{"text":"Listings Management"},{"text":"AI Review Responses"},{"text":"Competitor Analysis"},{"text":"Priority Support"},{"text":"Custom Reports"}]},{"name":"Enterprise","monthly":249,"annual":199,"desc":"For agencies & multi-location brands","popular":false,"features":[{"text":"Unlimited Locations"},{"text":"Everything in Professional"},{"text":"White-Label Reports"},{"text":"API Access"},{"text":"Dedicated Account Manager"},{"text":"Custom Integrations"},{"text":"SLA Guarantee"}]}]}},
  {"id":"faq","type":"component","data":{"component":"PricingFAQ","title":"Frequently Asked Questions","faqs":[{"q":"Can I try GMB Briefcase for free?","a":"Yes! All plans come with a 14-day free trial. No credit card required."},{"q":"Can I change my plan later?","a":"Absolutely. You can upgrade or downgrade your plan at any time from your dashboard."},{"q":"What happens after my trial ends?","a":"You will be prompted to choose a plan. Your data and settings are preserved."},{"q":"Do you offer discounts for agencies?","a":"Yes, we offer volume discounts for agencies managing 20+ locations. Contact our sales team."},{"q":"Is there a setup fee?","a":"No setup fees. You can be up and running in minutes."}]}}
]'::jsonb
WHERE slug = 'pricing';

-- ABOUT page
UPDATE public.pages SET content = '[
  {"id":"hero","type":"component","data":{"component":"AboutHero","title":"Empowering Local Businesses to Thrive","subtitle":"We built GMB Briefcase because local businesses deserve enterprise-level tools without the enterprise-level complexity or cost."}},
  {"id":"values","type":"component","data":{"component":"ValuesGrid","sectionTitle":"Our Values","sectionSubtitle":"What drives everything we do."}},
  {"id":"stats","type":"component","data":{"component":"StatsBar","stats":[{"value":10000,"suffix":"+","label":"Businesses"},{"value":5,"suffix":"M+","label":"Reviews Managed"},{"value":50,"suffix":"+","label":"Integrations"},{"value":99,"suffix":"%","label":"Uptime"}]}},
  {"id":"cta","type":"component","data":{"component":"CTABanner","title":"Ready to Grow Your Business?","subtitle":"Join 10,000+ businesses already using GMB Briefcase to dominate local search.","ctaPrimaryText":"Start Free Trial","ctaPrimaryLink":"/pricing","ctaSecondaryText":"Talk to Sales","ctaSecondaryLink":"/contact"}}
]'::jsonb
WHERE slug = 'about';

-- CONTACT page already has props populated, but ensure ContactInfo is included
UPDATE public.pages SET content = '[
  {"id":"form","type":"component","data":{"component":"ContactForm","title":"Get in Touch","subtitle":"Have a question or want to see a demo? We''d love to hear from you.","formTitle":"Send us a message","buttonText":"Send Message"}}
]'::jsonb
WHERE slug = 'contact';
