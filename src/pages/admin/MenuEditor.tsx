import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCmsMenu, useUpdateMenu, useSaveMenuItems, type CmsMenuItem } from "@/hooks/useCmsMenus";
import { useCmsPages } from "@/hooks/useCmsPages";
import { useToast } from "@/hooks/use-toast";

// Available Lucide icon names for mega menu items
const ICON_OPTIONS = [
  "none", "MapPin", "BarChart3", "Star", "FileText", "Megaphone", "Users",
  "BookOpen", "HelpCircle", "Building2", "ShoppingBag", "Stethoscope", "Scale",
  "Zap", "Shield", "Globe", "Settings", "Mail", "Phone", "Calendar",
  "Camera", "Heart", "Target", "TrendingUp", "Award", "Briefcase",
];

interface LocalItem {
  id: string;
  label: string;
  url: string;
  page_id: string | null;
  parent_id: string | null;
  target: string;
  css_class: string;
  icon: string;
  description: string;
  expanded: boolean;
}

function generateId() {
  return crypto.randomUUID();
}

export default function MenuEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading } = useCmsMenu(id);
  const { data: pages } = useCmsPages();
  const updateMenu = useUpdateMenu();
  const saveItems = useSaveMenuItems();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("header");
  const [items, setItems] = useState<LocalItem[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      setName(data.menu.name);
      setLocation(data.menu.location);
      setItems(
        data.items.map((item) => ({
          id: item.id,
          label: item.label,
          url: item.url || "",
          page_id: item.page_id,
          parent_id: item.parent_id,
          target: item.target || "_self",
          css_class: item.css_class || "",
          icon: item.icon || "",
          description: item.description || "",
          expanded: false,
        }))
      );
    }
  }, [data]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        label: "",
        url: "",
        page_id: null,
        parent_id: null,
        target: "_self",
        css_class: "",
        icon: "",
        description: "",
        expanded: true,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    const removedId = items[idx].id;
    setItems((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((item) =>
          item.parent_id === removedId ? { ...item, parent_id: null } : item
        )
    );
  };

  const updateItem = (idx: number, patch: Partial<LocalItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const toggleExpand = (idx: number) => {
    updateItem(idx, { expanded: !items[idx].expanded });
  };

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setItems((prev) => {
      const newItems = [...prev];
      const [moved] = newItems.splice(dragIdx, 1);
      newItems.splice(idx, 0, moved);
      return newItems;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const indentItem = (idx: number) => {
    if (idx === 0) return;
    const parentId = items[idx - 1].id;
    updateItem(idx, { parent_id: parentId });
  };
  const outdentItem = (idx: number) => {
    updateItem(idx, { parent_id: null });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateMenu.mutateAsync({ id, name, location });
      await saveItems.mutateAsync({
        menu_id: id,
        items: items.map((item) => ({
          id: item.id,
          label: item.label,
          url: item.url || null,
          page_id: item.page_id,
          parent_id: item.parent_id,
          target: item.target,
          css_class: item.css_class || null,
          icon: item.icon || null,
          description: item.description || null,
        })),
      });
      toast({ title: "Menu saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/menus")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Menu</h1>
        </div>
        <Button onClick={handleSave} disabled={updateMenu.isPending || saveItems.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateMenu.isPending || saveItems.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Menu settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Menu Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Menu Items</h2>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Nest items under a parent to create dropdown menus. Add an icon & description for mega menu cards.
        </p>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No items yet. Click "Add Item" to start building your menu.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => {
              const isNested = !!item.parent_id;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={onDragEnd}
                  className={`border border-border rounded-lg bg-background transition-all ${
                    dragIdx === idx ? "opacity-50" : ""
                  } ${isNested ? "ml-8" : ""}`}
                >
                  {/* Item header row */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <button onClick={() => toggleExpand(idx)} className="p-0.5 hover:bg-muted rounded">
                      {item.expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {item.label || "(untitled)"}
                    </span>
                    {item.icon && item.icon !== "none" && (
                      <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {item.icon}
                      </span>
                    )}
                    {isNested && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        nested
                      </span>
                    )}
                    <div className="flex gap-1">
                      {idx > 0 && !isNested && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => indentItem(idx)} title="Nest under previous">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                      {isNested && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => outdentItem(idx)} title="Un-nest">
                          <ChevronDown className="h-3 w-3 rotate-90" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {item.expanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input value={item.label} onChange={(e) => updateItem(idx, { label: e.target.value })} placeholder="Home" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">URL</Label>
                          <Input value={item.url} onChange={(e) => updateItem(idx, { url: e.target.value, page_id: null })} placeholder="/about or https://…" className="h-8 text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Link to Page</Label>
                          <Select
                            value={item.page_id || "none"}
                            onValueChange={(val) =>
                              updateItem(idx, {
                                page_id: val === "none" ? null : val,
                                url: val !== "none" ? `/${pages?.find((p) => p.id === val)?.slug || ""}` : item.url,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="— Custom URL —" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">— Custom URL —</SelectItem>
                              {pages?.map((page) => (
                                <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Target</Label>
                          <Select value={item.target} onValueChange={(val) => updateItem(idx, { target: val })}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_self">Same Tab</SelectItem>
                              <SelectItem value="_blank">New Tab</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Icon</Label>
                          <Select value={item.icon || "none"} onValueChange={(val) => updateItem(idx, { icon: val === "none" ? "" : val })}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No icon" /></SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((icon) => (
                                <SelectItem key={icon} value={icon}>{icon === "none" ? "— No Icon —" : icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Description <span className="text-muted-foreground">(for mega menu)</span></Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(idx, { description: e.target.value })}
                            placeholder="Short description shown in dropdown"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CSS Class</Label>
                          <Input value={item.css_class} onChange={(e) => updateItem(idx, { css_class: e.target.value })} placeholder="optional" className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
