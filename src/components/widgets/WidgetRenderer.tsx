import { usePublicWidgets, type PublicWidget } from "@/hooks/usePublicWidgets";
import { X } from "lucide-react";
import { useState } from "react";

// ─── Individual widget renderers ─────────────────────────────────────

function BannerWidget({ widget }: { widget: PublicWidget }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const content = widget.content as Record<string, string>;
  const text = content?.text || content?.html || widget.title || "";
  const bgColor = content?.bg_color || "hsl(var(--primary))";
  const textColor = content?.text_color || "hsl(var(--primary-foreground))";
  const link = content?.link || "";

  const inner = (
    <div
      className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span dangerouslySetInnerHTML={{ __html: text }} />
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (link) {
    return <a href={link} className="block">{inner}</a>;
  }
  return inner;
}

function HtmlWidget({ widget }: { widget: PublicWidget }) {
  const content = widget.content as Record<string, string>;
  const html = content?.html || "";

  return (
    <div className="px-4 py-3">
      {widget.title && (
        <h3 className="text-sm font-semibold text-foreground mb-2">{widget.title}</h3>
      )}
      <div
        className="prose prose-sm max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function CtaWidget({ widget }: { widget: PublicWidget }) {
  const content = widget.content as Record<string, string>;
  const heading = content?.heading || widget.title || "Get Started";
  const description = content?.description || "";
  const buttonText = content?.button_text || "Learn More";
  const buttonLink = content?.button_link || "/";

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
      <h3 className="text-lg font-bold text-foreground mb-2">{heading}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      <a
        href={buttonLink}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {buttonText}
      </a>
    </div>
  );
}

function NewsletterWidget({ widget }: { widget: PublicWidget }) {
  const content = widget.content as Record<string, string>;
  const heading = content?.heading || widget.title || "Stay Updated";
  const description = content?.description || "Subscribe to our newsletter.";

  return (
    <div className="bg-muted rounded-xl p-6">
      <h3 className="text-sm font-bold text-foreground mb-1">{heading}</h3>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

function SocialWidget({ widget }: { widget: PublicWidget }) {
  const content = widget.content as Record<string, string>;
  const links = Object.entries(content || {}).filter(([, v]) => v);

  return (
    <div className="px-4 py-3">
      {widget.title && (
        <h3 className="text-sm font-semibold text-foreground mb-2">{widget.title}</h3>
      )}
      <div className="flex gap-3">
        {links.map(([platform, url]) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline capitalize"
          >
            {platform}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Widget type router ──────────────────────────────────────────────

function RenderWidget({ widget }: { widget: PublicWidget }) {
  switch (widget.widget_type) {
    case "banner":
      return <BannerWidget widget={widget} />;
    case "html":
      return <HtmlWidget widget={widget} />;
    case "cta":
      return <CtaWidget widget={widget} />;
    case "newsletter":
      return <NewsletterWidget widget={widget} />;
    case "social":
      return <SocialWidget widget={widget} />;
    default:
      return null;
  }
}

// ─── Location-based widget list ──────────────────────────────────────

interface WidgetZoneProps {
  location: string;
  className?: string;
}

export function WidgetZone({ location, className }: WidgetZoneProps) {
  const { data: widgets } = usePublicWidgets(location);

  if (!widgets?.length) return null;

  return (
    <div className={className}>
      {widgets.map((w) => (
        <RenderWidget key={w.id} widget={w} />
      ))}
    </div>
  );
}
