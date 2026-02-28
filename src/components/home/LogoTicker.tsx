interface LogoTickerProps {
  heading?: string;
}

const logos = [
  "Google", "Yelp", "Facebook", "TripAdvisor", "Apple Maps",
  "Bing", "Foursquare", "Trustpilot", "BBB", "Citysearch",
];

export function LogoTicker({ heading = "Trusted by businesses managing their presence on" }: LogoTickerProps) {
  return (
    <section className="py-10 border-b border-border overflow-hidden bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 mb-4">
        <p className="text-center text-sm font-medium text-muted-foreground">{heading}</p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...logos, ...logos].map((name, i) => (
            <div key={i} className="flex items-center justify-center min-w-[120px] text-muted-foreground/60 font-semibold text-lg select-none">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
