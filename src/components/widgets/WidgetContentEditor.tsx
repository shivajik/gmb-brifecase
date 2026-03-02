import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface WidgetContentEditorProps {
  widgetType: string;
  content: Record<string, string>;
  onChange: (content: Record<string, string>) => void;
}

function field(
  content: Record<string, string>,
  onChange: (c: Record<string, string>) => void,
  key: string,
  label: string,
  opts?: { multiline?: boolean; placeholder?: string }
) {
  const val = content[key] || "";
  return (
    <div className="space-y-1.5" key={key}>
      <Label className="text-xs">{label}</Label>
      {opts?.multiline ? (
        <Textarea
          value={val}
          onChange={(e) => onChange({ ...content, [key]: e.target.value })}
          rows={3}
          placeholder={opts?.placeholder}
          className="text-sm"
        />
      ) : (
        <Input
          value={val}
          onChange={(e) => onChange({ ...content, [key]: e.target.value })}
          placeholder={opts?.placeholder}
          className="text-sm"
        />
      )}
    </div>
  );
}

function BannerFields({ content, onChange }: { content: Record<string, string>; onChange: (c: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      {field(content, onChange, "text", "Banner Text", { placeholder: "🎉 Special offer — 20% off!" })}
      {field(content, onChange, "link", "Link URL", { placeholder: "https://..." })}
      <div className="grid grid-cols-2 gap-3">
        {field(content, onChange, "bg_color", "Background Color", { placeholder: "hsl(var(--primary))" })}
        {field(content, onChange, "text_color", "Text Color", { placeholder: "hsl(var(--primary-foreground))" })}
      </div>
    </div>
  );
}

function HtmlFields({ content, onChange }: { content: Record<string, string>; onChange: (c: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      {field(content, onChange, "html", "HTML Content", { multiline: true, placeholder: "<p>Your content here...</p>" })}
    </div>
  );
}

function CtaFields({ content, onChange }: { content: Record<string, string>; onChange: (c: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      {field(content, onChange, "heading", "Heading", { placeholder: "Get Started Today" })}
      {field(content, onChange, "description", "Description", { multiline: true, placeholder: "A short description..." })}
      <div className="grid grid-cols-2 gap-3">
        {field(content, onChange, "button_text", "Button Text", { placeholder: "Learn More" })}
        {field(content, onChange, "button_link", "Button Link", { placeholder: "/" })}
      </div>
    </div>
  );
}

function NewsletterFields({ content, onChange }: { content: Record<string, string>; onChange: (c: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      {field(content, onChange, "heading", "Heading", { placeholder: "Stay Updated" })}
      {field(content, onChange, "description", "Description", { placeholder: "Subscribe to our newsletter." })}
    </div>
  );
}

function SocialFields({ content, onChange }: { content: Record<string, string>; onChange: (c: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      {field(content, onChange, "twitter", "Twitter URL", { placeholder: "https://twitter.com/..." })}
      {field(content, onChange, "facebook", "Facebook URL", { placeholder: "https://facebook.com/..." })}
      {field(content, onChange, "linkedin", "LinkedIn URL", { placeholder: "https://linkedin.com/..." })}
      {field(content, onChange, "instagram", "Instagram URL", { placeholder: "https://instagram.com/..." })}
      {field(content, onChange, "youtube", "YouTube URL", { placeholder: "https://youtube.com/..." })}
    </div>
  );
}

export function WidgetContentEditor({ widgetType, content, onChange }: WidgetContentEditorProps) {
  switch (widgetType) {
    case "banner":
      return <BannerFields content={content} onChange={onChange} />;
    case "html":
      return <HtmlFields content={content} onChange={onChange} />;
    case "cta":
      return <CtaFields content={content} onChange={onChange} />;
    case "newsletter":
      return <NewsletterFields content={content} onChange={onChange} />;
    case "social":
      return <SocialFields content={content} onChange={onChange} />;
    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">Content (JSON)</Label>
          <Textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try { onChange(JSON.parse(e.target.value)); } catch {}
            }}
            rows={6}
            className="font-mono text-xs"
          />
        </div>
      );
  }
}
