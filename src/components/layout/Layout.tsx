import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { WidgetZone } from "@/components/widgets/WidgetRenderer";

export function Layout({ children }: { children: ReactNode }) {
  useAppearanceSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <WidgetZone location="header-banner" />
      <Header />
      <WidgetZone location="before-content" className="container mx-auto max-w-7xl px-4 py-4" />
      <div className="flex-1 flex">
        <main className="flex-1">{children}</main>
        <WidgetZone location="sidebar" className="hidden lg:block w-72 shrink-0 border-l border-border p-4 space-y-4" />
      </div>
      <WidgetZone location="after-content" className="container mx-auto max-w-7xl px-4 py-4" />
      <WidgetZone location="footer" className="border-t border-border bg-muted/30 py-6 container mx-auto max-w-7xl px-4" />
      <Footer />
    </div>
  );
}
