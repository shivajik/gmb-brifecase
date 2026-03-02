import { useState } from "react";
import { useCmsWidgets, useCreateWidget, useUpdateWidget, useDeleteWidget, CmsWidget } from "@/hooks/useCmsWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  content: string; // JSON string for editing
}

const emptyForm: WidgetFormData = {
  title: "",
  widget_type: "html",
  location: "sidebar",
  active: true,
  sort_order: 0,
  content: "{}",
};

export default function WidgetList() {
  const { data: widgets, isLoading } = useCmsWidgets();
  const createWidget = useCreateWidget();
  const updateWidget = useUpdateWidget();
  const deleteWidget = useDeleteWidget();
  const { toast } = useToast();

  const [editingWidget, setEditingWidget] = useState<CmsWidget | null>(null);
  const [formData, setFormData] = useState<WidgetFormData>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      content: JSON.stringify(widget.content, null, 2),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(formData.content);
    } catch {
      toast({ title: "Invalid JSON in content field", variant: "destructive" });
      return;
    }

    try {
      if (editingWidget) {
        await updateWidget.mutateAsync({
          id: editingWidget.id,
          title: formData.title || null,
          widget_type: formData.widget_type,
          location: formData.location,
          active: formData.active,
          sort_order: formData.sort_order,
          content: parsedContent,
        });
        toast({ title: "Widget updated" });
      } else {
        await createWidget.mutateAsync({
          title: formData.title || null,
          widget_type: formData.widget_type,
          location: formData.location,
          active: formData.active,
          sort_order: formData.sort_order,
          content: parsedContent,
        });
        toast({ title: "Widget created" });
      }
      setDialogOpen(false);
    } catch (err) {
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
          <p className="text-muted-foreground mt-1">Manage reusable content blocks across your site.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Widget
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading widgets…</p>
      ) : !widgets?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Box className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No widgets yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {widgets.map((w) => (
            <Card key={w.id} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${w.active ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  <CardTitle className="text-base">{w.title || "Untitled"}</CardTitle>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {w.widget_type}
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {w.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(w)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
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
                <Select value={formData.widget_type} onValueChange={(v) => setFormData((f) => ({ ...f, widget_type: v }))}>
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

            <div className="space-y-2">
              <Label>Content (JSON)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                rows={6}
                className="font-mono text-xs"
                placeholder='{"html": "<p>Hello</p>"}'
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
