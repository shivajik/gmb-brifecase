import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Eye, Save } from "lucide-react";

interface BlockToolbarProps {
  onAddElement: () => void;
  onSave: () => void;
  onPreview?: () => void;
  saving: boolean;
  slug?: string;
}

export function BlockToolbar({ onAddElement, onSave, onPreview, saving, slug }: BlockToolbarProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 bg-card border-b border-border shadow-sm">
      <Button variant="default" size="sm" onClick={onAddElement} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add Element
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex-1" />

      {slug && (
        <Button variant="ghost" size="sm" onClick={onPreview} className="gap-1.5 text-muted-foreground">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      )}

      <Button onClick={onSave} disabled={saving} size="sm" className="gap-1.5">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
