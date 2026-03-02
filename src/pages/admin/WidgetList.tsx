import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCmsWidgets, useCreateWidget, useUpdateWidget, useDeleteWidget, useReorderWidgets, CmsWidget } from "@/hooks/useCmsWidgets";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Box, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WidgetContentEditor } from "@/components/widgets/WidgetContentEditor";

const WIDGET_TYPES = [
  { value: "html", label: "HTML / Rich Text" },
  { value: "banner", label: "Banner" },
  { value: "cta", label: "Call to Action" },
  { value: "social", label: "Social Links" },
  { value: "newsletter", label: "Newsletter Signup" },
];

const LOCATIONS = [
  { value: "sidebar", label: "Sidebar" },
  { value: "footer", label: "Footer" },
  { value: "header-banner", label: "Header Banner" },
  { value: "before-content", label: "Before Content" },
  { value: "after-content", label: "After Content" },
];

interface WidgetFormData {
  title: string;
  widget_type: string;
  location: string;
  active: boolean;
  sort_order: number;
  content: Record<string, string>;
}

const emptyForm: WidgetFormData = {
  title: "",
  widget_type: "html",
  location: "sidebar",
  active: true,
  sort_order: 0,
  content: {},
};

// ─── Sortable Widget Card ────────────────────────────────────────────

function SortableWidgetCard({
  widget,
  onEdit,
  onDelete,
}: {
  widget: CmsWidget;
  onEdit: (w: CmsWidget) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className={`w-2 h-2 rounded-full ${widget.active ? "bg-green-500" : "bg-muted-foreground/30"}`} />
          <CardTitle className="text-base">{widget.title || "Untitled"}</CardTitle>
          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{widget.widget_type}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{widget.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(widget)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(widget.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

// ─── Main Widget List ────────────────────────────────────────────────

export default function WidgetList() {
  const { data: widgets, isLoading } = useCmsWidgets();
  const createWidget = useCreateWidget();
  const updateWidget = useUpdateWidget();
  const deleteWidget = useDeleteWidget();
  const reorderWidgets = useReorderWidgets();
  const { toast } = useToast();

  const [editingWidget, setEditingWidget] = useState<CmsWidget | null>(null);
  const [formData, setFormData] = useState<WidgetFormData>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState<CmsWidget[] | null>(null);

  const displayWidgets = localOrder ?? widgets ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !displayWidgets.length) return;

    const oldIndex = displayWidgets.findIndex((w) => w.id === active.id);
    const newIndex = displayWidgets.findIndex((w) => w.id === over.id);
    const reordered = arrayMove(displayWidgets, oldIndex, newIndex);

    setLocalOrder(reordered);

    const items = reordered.map((w, i) => ({ id: w.id, sort_order: i }));
    reorderWidgets.mutate(items, {
      onSuccess: () => {
        setLocalOrder(null);
        toast({ title: "Widget order saved" });
      },
      onError: () => {
        setLocalOrder(null);
        toast({ title: "Failed to save order", variant: "destructive" });
      },
    });
  };

  const openCreate = () => {
    setEditingWidget(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (widget: CmsWidget) => {
    setEditingWidget(widget);
    setFormData({
      title: widget.title || "",
      widget_type: widget.widget_type,
      location: widget.location,
      active: widget.active,
      sort_order: widget.sort_order,
      content: (widget.content || {}) as Record<string, string>,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title || null,
        widget_type: formData.widget_type,
        location: formData.location,
        active: formData.active,
        sort_order: formData.sort_order,
        content: formData.content,
      };
      if (editingWidget) {
        await updateWidget.mutateAsync({ id: editingWidget.id, ...payload });
        toast({ title: "Widget updated" });
      } else {
        await createWidget.mutateAsync(payload);
        toast({ title: "Widget created" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Error saving widget", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this widget?")) return;
    try {
      await deleteWidget.mutateAsync(id);
      toast({ title: "Widget deleted" });
    } catch {
      toast({ title: "Error deleting widget", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Widgets</h1>
          <p className="text-muted-foreground mt-1">Drag to reorder. Manage reusable content blocks across your site.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Widget
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading widgets…</p>
      ) : !displayWidgets.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Box className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No widgets yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayWidgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {displayWidgets.map((w) => (
                <SortableWidgetCard key={w.id} widget={w} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWidget ? "Edit Widget" : "Create Widget"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                placeholder="Widget title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.widget_type}
                  onValueChange={(v) => setFormData((f) => ({ ...f, widget_type: v, content: {} }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={(v) => setFormData((f) => ({ ...f, location: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(v) => setFormData((f) => ({ ...f, active: v }))}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-sm font-semibold mb-3 block">Content</Label>
              <WidgetContentEditor
                widgetType={formData.widget_type}
                content={formData.content}
                onChange={(content) => setFormData((f) => ({ ...f, content }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createWidget.isPending || updateWidget.isPending}>
                {editingWidget ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
