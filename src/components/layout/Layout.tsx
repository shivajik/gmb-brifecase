import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { WidgetZone } from "@/components/widgets/WidgetRenderer";

export function Layout({ children }: { children: ReactNode }) {
  useAppearanceSettings();
  const siteSettings = useSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <WidgetZone location="header-banner" />
      <Header siteName={siteSettings.siteName} logoUrl={siteSettings.logoUrl} />
      <WidgetZone location="before-content" className="container mx-auto max-w-7xl px-4 py-4" />
      <main className="flex-1">{children}</main>
      <WidgetZone location="after-content" className="container mx-auto max-w-7xl px-4 py-4" />
      <WidgetZone location="footer" className="border-t border-border bg-muted/30 py-6 container mx-auto max-w-7xl px-4" />
      <Footer siteName={siteSettings.siteName} logoUrl={siteSettings.logoUrl} />
    </div>
  );
}
