import { icons, type LucideIcon } from "lucide-react";

/**
 * Resolves a Lucide icon name (PascalCase) to its component.
 * Returns null if not found.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon | null {
  if (!name) return null;
  return (icons as Record<string, LucideIcon>)[name] ?? null;
}
