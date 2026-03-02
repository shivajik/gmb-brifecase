import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";

export function Layout({ children }: { children: ReactNode }) {
  useAppearanceSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
