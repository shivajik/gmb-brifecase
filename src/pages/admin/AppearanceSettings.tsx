import { useEffect, useState } from "react";
import { useCmsSettings, useBulkUpsertSettings } from "@/hooks/useCmsSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Palette, Type, Layout } from "lucide-react";

interface AppearanceForm {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  hero_gradient_from: string;
  hero_gradient_to: string;
}

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Playfair Display", "Merriweather",
  "Open Sans", "Lato", "Montserrat", "Source Sans 3", "DM Sans",
  "Space Grotesk", "JetBrains Mono", "system-ui",
];

const RADIUS_OPTIONS = [
  { value: "0", label: "None (0)" },
  { value: "0.25rem", label: "Small (0.25rem)" },
  { value: "0.5rem", label: "Medium (0.5rem)" },
  { value: "0.75rem", label: "Large (0.75rem)" },
  { value: "1rem", label: "XL (1rem)" },
  { value: "9999px", label: "Full (pill)" },
];

const defaultForm: AppearanceForm = {
  primary_color: "#2563eb",
  secondary_color: "#f1f5f9",
  accent_color: "#8b5cf6",
  heading_font: "Inter",
  body_font: "Inter",
  border_radius: "0.5rem",
  hero_gradient_from: "#f1f5f9",
  hero_gradient_to: "#ede9fe",
};

export default function AppearanceSettings() {
  const { data: settings, isLoading } = useCmsSettings("appearance");
  const bulkUpsert = useBulkUpsertSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<AppearanceForm>(defaultForm);

  // Hydrate form from DB settings
  useEffect(() => {
    if (!settings?.length) return;
    const map: Record<string, unknown> = {};
    settings.forEach((s) => {
      map[s.key] = typeof s.value === "object" && s.value !== null && "v" in (s.value as Record<string, unknown>)
        ? (s.value as Record<string, unknown>).v
        : s.value;
    });
    setForm((f) => ({
      ...f,
      ...Object.fromEntries(
        Object.keys(defaultForm).filter((k) => map[k] !== undefined).map((k) => [k, map[k] as string])
      ),
    }));
  }, [settings]);

  const handleSave = async () => {
    try {
      await bulkUpsert.mutateAsync(
        Object.entries(form).map(([key, value]) => ({
          key,
          group: "appearance",
          value: { v: value },
        }))
      );
      toast({ title: "Appearance settings saved" });
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
  };

  const update = (key: keyof AppearanceForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
          <p className="text-muted-foreground mt-1">Customize your site's visual identity.</p>
        </div>
        <Button onClick={handleSave} disabled={bulkUpsert.isPending}>
          Save Changes
        </Button>
      </div>

      {/* Colors */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Colors</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            ["primary_color", "Primary Color"],
            ["secondary_color", "Secondary Color"],
            ["accent_color", "Accent Color"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-10 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hero Gradient */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Layout className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Hero Gradient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              ["hero_gradient_from", "Gradient From"],
              ["hero_gradient_to", "Gradient To"],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-10 h-10 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="h-16 rounded-lg border border-border"
            style={{
              background: `linear-gradient(135deg, ${form.hero_gradient_from}, ${form.hero_gradient_to})`,
            }}
          />
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Type className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Typography</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ["heading_font", "Heading Font"],
            ["body_font", "Body Font"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Select value={form[key]} onValueChange={(v) => update(key, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: form[key] }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 max-w-xs">
            <Label>Border Radius</Label>
            <Select value={form.border_radius} onValueChange={(v) => update("border_radius", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 mt-3">
              <div
                className="w-16 h-16 bg-primary"
                style={{ borderRadius: form.border_radius }}
              />
              <div
                className="w-32 h-10 bg-primary flex items-center justify-center text-primary-foreground text-sm"
                style={{ borderRadius: form.border_radius }}
              >
                Button
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
