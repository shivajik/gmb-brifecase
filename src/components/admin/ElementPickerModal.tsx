import { useState } from "react";
import { Search, Type, Pilcrow, Image, Code, Minus, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getComponentSchema } from "@/components/cms/ComponentPropSchemas";
import COMPONENT_REGISTRY from "@/components/cms/ComponentRegistry";

interface ElementPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string, componentName?: string) => void;
}

const CONTENT_ELEMENTS = [
  { type: "heading", label: "Heading", description: "Title or section heading (H1–H4)", icon: Type },
  { type: "paragraph", label: "Paragraph", description: "Rich text content block", icon: Pilcrow },
  { type: "image", label: "Image", description: "Image with alt text and caption", icon: Image },
  { type: "html", label: "HTML", description: "Raw HTML code block", icon: Code },
  { type: "spacer", label: "Spacer", description: "Vertical spacing between blocks", icon: Minus },
] as const;

const COMPONENT_NAMES = Object.keys(COMPONENT_REGISTRY);

export function ElementPickerModal({ open, onClose, onSelect }: ElementPickerModalProps) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();

  const filteredContent = CONTENT_ELEMENTS.filter(
    (el) => el.label.toLowerCase().includes(q) || el.description.toLowerCase().includes(q)
  );

  const filteredComponents = COMPONENT_NAMES.filter((name) => {
    const schema = getComponentSchema(name);
    const label = schema?.label || name;
    return label.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  const handleSelect = (type: string, componentName?: string) => {
    onSelect(type, componentName);
    onClose();
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setSearch(""); } }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Element</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 py-2">
          {/* Content Elements */}
          {filteredContent.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Content
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredContent.map((el) => (
                  <button
                    key={el.type}
                    onClick={() => handleSelect(el.type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/50 transition-colors text-center group"
                  >
                    <el.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground">{el.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{el.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Component Elements */}
          {filteredComponents.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Components
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredComponents.map((name) => {
                  const schema = getComponentSchema(name);
                  return (
                    <button
                      key={name}
                      onClick={() => handleSelect("component", name)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-accent/50 transition-colors text-center group"
                    >
                      <Settings2 className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">{schema?.label || name}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {schema?.fields.length ? `${schema.fields.length} editable props` : "No editable props"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredContent.length === 0 && filteredComponents.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No elements match your search.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
