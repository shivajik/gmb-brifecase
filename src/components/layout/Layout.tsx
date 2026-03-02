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
      <main className="flex-1">{children}</main>
      <WidgetZone location="after-content" className="container mx-auto max-w-7xl px-4 py-4" />
      <Footer />
    </div>
  );
}
