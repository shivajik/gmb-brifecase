import { useEffect, useState } from "react";
import { useCmsSettings, useBulkUpsertSettings } from "@/hooks/useCmsSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Globe, Share2, Code, Shield, AlertCircle } from "lucide-react";

interface GeneralForm {
  site_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  favicon_url: string;
}

interface SocialForm {
  twitter: string;
  linkedin: string;
  facebook: string;
  youtube: string;
  instagram: string;
}

interface AdvancedForm {
  head_scripts: string;
  footer_scripts: string;
  robots_txt: string;
  google_analytics_id: string;
}

const defaultGeneral: GeneralForm = {
  site_name: "GMB Briefcase",
  tagline: "Manage your local business presence",
  description: "",
  logo_url: "",
  favicon_url: "",
};

const defaultSocial: SocialForm = {
  twitter: "",
  linkedin: "",
  facebook: "",
  youtube: "",
  instagram: "",
};

const defaultAdvanced: AdvancedForm = {
  head_scripts: "",
  footer_scripts: "",
  robots_txt: "",
  google_analytics_id: "",
};

function extractValue(s: { value: unknown }): string {
  const v = s.value;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "v" in (v as Record<string, unknown>))
    return String((v as Record<string, unknown>).v ?? "");
  return String(v ?? "");
}

export default function SiteSettings() {
  const { data: generalSettings, isLoading: l1 } = useCmsSettings("general");
  const { data: socialSettings, isLoading: l2 } = useCmsSettings("social");
  const { data: advancedSettings, isLoading: l3 } = useCmsSettings("advanced");
  const bulkUpsert = useBulkUpsertSettings();
  const { toast } = useToast();

  const [general, setGeneral] = useState<GeneralForm>(defaultGeneral);
  const [social, setSocial] = useState<SocialForm>(defaultSocial);
  const [advanced, setAdvanced] = useState<AdvancedForm>(defaultAdvanced);

  useEffect(() => {
    if (!generalSettings?.length) return;
    const map: Record<string, string> = {};
    generalSettings.forEach((s) => (map[s.key] = extractValue(s)));
    setGeneral((f) => ({
      ...f,
      ...Object.fromEntries(Object.keys(defaultGeneral).filter((k) => map[k] !== undefined).map((k) => [k, map[k]])),
    }));
  }, [generalSettings]);

  useEffect(() => {
    if (!socialSettings?.length) return;
    const map: Record<string, string> = {};
    socialSettings.forEach((s) => (map[s.key] = extractValue(s)));
    setSocial((f) => ({
      ...f,
      ...Object.fromEntries(Object.keys(defaultSocial).filter((k) => map[k] !== undefined).map((k) => [k, map[k]])),
    }));
  }, [socialSettings]);

  useEffect(() => {
    if (!advancedSettings?.length) return;
    const map: Record<string, string> = {};
    advancedSettings.forEach((s) => (map[s.key] = extractValue(s)));
    setAdvanced((f) => ({
      ...f,
      ...Object.fromEntries(Object.keys(defaultAdvanced).filter((k) => map[k] !== undefined).map((k) => [k, map[k]])),
    }));
  }, [advancedSettings]);

  const [socialErrors, setSocialErrors] = useState<Partial<Record<keyof SocialForm, string>>>({});

  const validateSocialLinks = (): boolean => {
    const errors: Partial<Record<keyof SocialForm, string>> = {};
    let valid = true;
    for (const [key, value] of Object.entries(social) as [keyof SocialForm, string][]) {
      if (value && !value.startsWith("https://")) {
        errors[key] = "URL must start with https://";
        valid = false;
      }
    }
    setSocialErrors(errors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateSocialLinks()) {
      toast({ title: "Please fix social link errors before saving", variant: "destructive" });
      return;
    }
    try {
      const allSettings = [
        ...Object.entries(general).map(([key, value]) => ({ key, group: "general", value: { v: value } })),
        ...Object.entries(social).map(([key, value]) => ({ key, group: "social", value: { v: value } })),
        ...Object.entries(advanced).map(([key, value]) => ({ key, group: "advanced", value: { v: value } })),
      ];
      await bulkUpsert.mutateAsync(allSettings);
      toast({ title: "Settings saved successfully" });
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
  };

  const isLoading = l1 || l2 || l3;
  if (isLoading) return <p className="text-muted-foreground">Loading settings…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Configure general site options.</p>
        </div>
        <Button onClick={handleSave} disabled={bulkUpsert.isPending}>
          Save All Settings
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input value={general.site_name} onChange={(e) => setGeneral((f) => ({ ...f, site_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={general.tagline} onChange={(e) => setGeneral((f) => ({ ...f, tagline: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Site Description</Label>
            <Textarea value={general.description} onChange={(e) => setGeneral((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={general.logo_url} onChange={(e) => setGeneral((f) => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input value={general.favicon_url} onChange={(e) => setGeneral((f) => ({ ...f, favicon_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(defaultSocial) as (keyof SocialForm)[]).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key}</Label>
              <Input
                data-testid={`input-social-${key}`}
                value={social[key]}
                onChange={(e) => {
                  setSocial((f) => ({ ...f, [key]: e.target.value }));
                  if (socialErrors[key]) setSocialErrors((prev) => ({ ...prev, [key]: undefined }));
                }}
                placeholder={`https://${key}.com/...`}
                className={socialErrors[key] ? "border-destructive" : ""}
              />
              {socialErrors[key] && (
                <p className="text-xs text-destructive flex items-center gap-1" data-testid={`error-social-${key}`}>
                  <AlertCircle className="h-3 w-3" />
                  {socialErrors[key]}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Advanced / Code Injection */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Advanced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input
              value={advanced.google_analytics_id}
              onChange={(e) => setAdvanced((f) => ({ ...f, google_analytics_id: e.target.value }))}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Head Scripts</Label>
            <Textarea
              value={advanced.head_scripts}
              onChange={(e) => setAdvanced((f) => ({ ...f, head_scripts: e.target.value }))}
              rows={4}
              className="font-mono text-xs"
              placeholder="<!-- Scripts injected into <head> -->"
            />
          </div>
          <div className="space-y-2">
            <Label>Footer Scripts</Label>
            <Textarea
              value={advanced.footer_scripts}
              onChange={(e) => setAdvanced((f) => ({ ...f, footer_scripts: e.target.value }))}
              rows={4}
              className="font-mono text-xs"
              placeholder="<!-- Scripts injected before </body> -->"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
