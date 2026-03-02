import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { type ContentBlock } from "@/hooks/useCmsPages";
import { getComponentSchema, type PropField } from "@/components/cms/ComponentPropSchemas";

interface BlockSettingsPanelProps {
  block: ContentBlock | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (blockId: string, data: Record<string, unknown>) => void;
}

export function BlockSettingsPanel({ block, open, onClose, onUpdate }: BlockSettingsPanelProps) {
  if (!block) return null;

  const isComponent = block.type === "component";
  const componentName = isComponent ? (block.data.component as string) : null;
  const schema = componentName ? getComponentSchema(componentName) : null;

  const update = (data: Record<string, unknown>) => onUpdate(block.id, data);

  const blockLabel = isComponent
    ? (schema?.label || componentName || "Component")
    : block.type.charAt(0).toUpperCase() + block.type.slice(1);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{blockLabel} Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {block.type === "heading" && (
            <>
              <div className="space-y-2">
                <Label>Heading Level</Label>
                <Select value={(block.data.level as string) || "h2"} onValueChange={(v) => update({ level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">H1</SelectItem>
                    <SelectItem value="h2">H2</SelectItem>
                    <SelectItem value="h3">H3</SelectItem>
                    <SelectItem value="h4">H4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text</Label>
                <RichTextEditor value={(block.data.text as string) || ""} onChange={(val) => update({ text: val })} placeholder="Heading text" minHeight={80} />
              </div>
            </>
          )}

          {block.type === "paragraph" && (
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor value={(block.data.text as string) || ""} onChange={(val) => update({ text: val })} placeholder="Paragraph text..." minHeight={150} />
            </div>
          )}

          {block.type === "image" && (
            <>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={(block.data.url as string) || ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input value={(block.data.alt as string) || ""} onChange={(e) => update({ alt: e.target.value })} placeholder="Describe the image" />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Input value={(block.data.caption as string) || ""} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional caption" />
              </div>
              {(block.data.url as string) && (
                <div className="border rounded-md overflow-hidden">
                  <img src={block.data.url as string} alt={(block.data.alt as string) || ""} className="w-full h-auto max-h-48 object-contain bg-muted" />
                </div>
              )}
            </>
          )}

          {block.type === "html" && (
            <div className="space-y-2">
              <Label>HTML Code</Label>
              <Textarea
                value={(block.data.code as string) || ""}
                onChange={(e) => update({ code: e.target.value })}
                placeholder="<div>Custom HTML...</div>"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          )}

          {block.type === "spacer" && (
            <div className="space-y-2">
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={(block.data.height as number) || 40}
                onChange={(e) => update({ height: parseInt(e.target.value) || 40 })}
                className="w-32"
              />
            </div>
          )}

          {isComponent && schema && schema.fields.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Leave fields empty to use built-in defaults.</p>
              {schema.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-sm">{field.label}</Label>
                  <PropFieldInput
                    field={field}
                    value={block.data[field.key]}
                    onChange={(val) => update({ [field.key]: val })}
                  />
                </div>
              ))}
            </div>
          )}

          {isComponent && schema && schema.fields.length === 0 && (
            <p className="text-sm text-muted-foreground italic">This component uses built-in defaults with no editable props.</p>
          )}

          {isComponent && !schema && (
            <p className="text-sm text-destructive italic">Unknown component: {componentName}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PropFieldInput({
  field,
  value,
  onChange,
}: {
  field: PropField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  if (field.type === "text" || field.type === "url") {
    return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }
  if (field.type === "textarea") {
    return <Textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={2} />;
  }
  if (field.type === "richtext") {
    return <RichTextEditor value={(value as string) || ""} onChange={(val) => onChange(val)} placeholder={field.placeholder} minHeight={100} />;
  }
  if (field.type === "number") {
    return <Input type="number" value={(value as number) ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder={field.placeholder} />;
  }
  if (field.type === "array" && field.itemFields) {
    const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[];
    const updateItem = (idx: number, key: string, val: unknown) => {
      onChange(items.map((item, i) => i === idx ? { ...item, [key]: val } : item));
    };
    const addItem = () => {
      const blank: Record<string, unknown> = {};
      field.itemFields!.forEach((f) => { blank[f.key] = ""; });
      onChange([...items, blank]);
    };
    const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="border rounded-md p-3 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(idx)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {field.itemFields!.map((subField) => (
              <div key={subField.key} className="space-y-1">
                <Label className="text-xs">{subField.label}</Label>
                <PropFieldInput field={subField} value={item[subField.key]} onChange={(val) => updateItem(idx, subField.key, val)} />
              </div>
            ))}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <Plus className="h-3 w-3 mr-1" /> Add Item
        </Button>
      </div>
    );
  }
  return null;
}
