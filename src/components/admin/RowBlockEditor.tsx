import { useState } from "react";
import { Plus, Trash2, Columns, Settings2, Type, Pilcrow, Image, Code, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ElementPickerModal } from "@/components/admin/ElementPickerModal";
import { type ContentBlock, type ColumnData, ROW_LAYOUTS } from "@/hooks/useCmsPages";
import { getComponentSchema } from "@/components/cms/ComponentPropSchemas";

interface RowBlockEditorProps {
  columns: ColumnData[];
  layout: string;
  onUpdate: (data: Record<string, unknown>) => void;
  onOpenBlockSettings: (block: ContentBlock, colId: string) => void;
}

const BLOCK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  heading: Type,
  paragraph: Pilcrow,
  image: Image,
  html: Code,
  spacer: Minus,
  component: Settings2,
};

function newBlock(type: ContentBlock["type"], componentName?: string): ContentBlock {
  const id = crypto.randomUUID();
  const defaults: Record<string, Record<string, unknown>> = {
    heading: { text: "", level: "h2" },
    paragraph: { text: "" },
    image: { url: "", alt: "", caption: "" },
    html: { code: "" },
    spacer: { height: 40 },
    component: { component: componentName || "" },
  };
  return { id, type, data: defaults[type] || {} };
}

/** Tailwind col-span class from a span number */
function colSpanClass(span: number): string {
  const map: Record<number, string> = {
    3: "col-span-3",
    4: "col-span-4",
    6: "col-span-6",
    8: "col-span-8",
    9: "col-span-9",
    12: "col-span-12",
  };
  return map[span] || `col-span-${span}`;
}

export function RowBlockEditor({ columns, layout, onUpdate, onOpenBlockSettings }: RowBlockEditorProps) {
  const [pickerColId, setPickerColId] = useState<string | null>(null);

  const changeLayout = (newLayout: string) => {
    const preset = ROW_LAYOUTS.find((l) => l.value === newLayout);
    if (!preset) return;

    const allBlocks = columns.flatMap((c) => c.blocks);
    const newCols: ColumnData[] = preset.columns.map((span, i) => ({
      id: crypto.randomUUID(),
      span,
      blocks: i === 0 ? allBlocks : [],
    }));
    onUpdate({ layout: newLayout, columns: newCols });
  };

  const addBlockToColumn = (colId: string, type: string, componentName?: string) => {
    const block = newBlock(type as ContentBlock["type"], componentName);
    const newCols = columns.map((c) =>
      c.id === colId ? { ...c, blocks: [...c.blocks, block] } : c
    );
    onUpdate({ columns: newCols });
    setPickerColId(null);
  };

  const updateBlockInColumn = (colId: string, blockId: string, data: Record<string, unknown>) => {
    const newCols = columns.map((c) =>
      c.id === colId
        ? { ...c, blocks: c.blocks.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)) }
        : c
    );
    onUpdate({ columns: newCols });
  };

  const removeBlockFromColumn = (colId: string, blockId: string) => {
    const newCols = columns.map((c) =>
      c.id === colId ? { ...c, blocks: c.blocks.filter((b) => b.id !== blockId) } : c
    );
    onUpdate({ columns: newCols });
  };

  return (
    <div className="space-y-2">
      {/* Layout selector */}
      <div className="flex items-center gap-2 mb-2">
        <Columns className="h-4 w-4 text-muted-foreground" />
        <Select value={layout} onValueChange={changeLayout}>
          <SelectTrigger className="h-7 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROW_LAYOUTS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Columns grid */}
      <div className="grid grid-cols-12 gap-2">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`${colSpanClass(col.span)} border border-dashed border-border rounded-md p-2 bg-muted/20 min-h-[80px] flex flex-col`}
          >
            {/* Column blocks */}
            <div className="flex-1 space-y-1">
              {col.blocks.map((block) => (
                <ColumnBlock
                  key={block.id}
                  block={block}
                  onUpdate={(data) => updateBlockInColumn(col.id, block.id, data)}
                  onRemove={() => removeBlockFromColumn(col.id, block.id)}
                  onEdit={() => onOpenBlockSettings(block, col.id)}
                />
              ))}
            </div>

            {/* Add element to column — opens full picker */}
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-6 text-[10px] text-muted-foreground"
                onClick={() => setPickerColId(col.id)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Full element picker modal for adding to columns */}
      <ElementPickerModal
        open={!!pickerColId}
        onClose={() => setPickerColId(null)}
        onSelect={(type, componentName) => {
          if (pickerColId) {
            addBlockToColumn(pickerColId, type, componentName);
          }
        }}
      />
    </div>
  );
}

/** Mini block renderer inside a column */
function ColumnBlock({
  block,
  onUpdate,
  onRemove,
  onEdit,
}: {
  block: ContentBlock;
  onUpdate: (data: Record<string, unknown>) => void;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isTextBlock = block.type === "heading" || block.type === "paragraph";
  const Icon = BLOCK_ICON_MAP[block.type] || Settings2;

  return (
    <div
      className="relative group border border-border rounded bg-card p-2 hover:border-primary/30 transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="absolute -top-2 right-1 z-10 flex items-center gap-0.5 bg-card border border-border rounded shadow-sm px-0.5 py-0.5">
          {!isTextBlock && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onEdit}>
              <Settings2 className="h-2.5 w-2.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={onRemove}>
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}

      {isTextBlock ? (
        <RichTextEditor
          value={(block.data.text as string) || ""}
          onChange={(val) => onUpdate({ text: val })}
          placeholder={block.type === "heading" ? "Heading..." : "Text..."}
          minHeight={40}
        />
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer" onClick={onEdit}>
          <Icon className="h-3 w-3" />
          <span className="truncate">
            {block.type === "component"
              ? (getComponentSchema(block.data.component as string)?.label || block.data.component as string)
              : block.type === "image"
                ? ((block.data.url as string) || "No image")
                : block.type === "spacer"
                  ? `↕ ${block.data.height || 40}px`
                  : block.type.charAt(0).toUpperCase() + block.type.slice(1)
            }
          </span>
        </div>
      )}
    </div>
  );
}
