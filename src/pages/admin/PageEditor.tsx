import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, GripVertical, Copy, Settings2, Type, Pilcrow, Image, Code, Minus, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

import { BlockToolbar } from "@/components/admin/BlockToolbar";
import { ElementPickerModal } from "@/components/admin/ElementPickerModal";
import { BlockSettingsPanel } from "@/components/admin/BlockSettingsPanel";
import { useCmsPage, useCreatePage, useUpdatePage, generateSlug, type ContentBlock } from "@/hooks/useCmsPages";
import { useToast } from "@/hooks/use-toast";
import { getComponentSchema } from "@/components/cms/ComponentPropSchemas";

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

const BLOCK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  heading: Type,
  paragraph: Pilcrow,
  image: Image,
  html: Code,
  spacer: Minus,
  component: Settings2,
};

export default function PageEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: existingPage, isLoading } = useCmsPage(isNew ? undefined : id);
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [template, setTemplate] = useState("default");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  // UI state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sidebar collapsible state
  const [publishOpen, setPublishOpen] = useState(true);
  const [attrsOpen, setAttrsOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title);
      setSlug(existingPage.slug);
      setStatus(existingPage.status);
      setTemplate(existingPage.template || "default");
      setBlocks(Array.isArray(existingPage.content) ? existingPage.content as ContentBlock[] : []);
      setMetaTitle(existingPage.meta_title || "");
      setMetaDesc(existingPage.meta_description || "");
      setMetaKeywords(existingPage.meta_keywords || "");
      setOgImage(existingPage.og_image || "");
      setSlugManual(true);
    }
  }, [existingPage]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(generateSlug(val));
  };

  const addBlock = (type: string, componentName?: string) => {
    setBlocks((prev) => [...prev, newBlock(type as ContentBlock["type"], componentName)]);
  };

  const updateBlock = (blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)));
    // Keep editing block in sync
    if (editingBlock && editingBlock.id === blockId) {
      setEditingBlock((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : prev);
    }
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (editingBlock?.id === blockId) {
      setEditingBlock(null);
      setSettingsPanelOpen(false);
    }
  };

  const duplicateBlock = (block: ContentBlock) => {
    const dup = { ...block, id: crypto.randomUUID(), data: { ...block.data } };
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === block.id);
      const arr = [...prev];
      arr.splice(idx + 1, 0, dup);
      return arr;
    });
  };

  const openBlockSettings = (block: ContentBlock) => {
    setEditingBlock(block);
    setSettingsPanelOpen(true);
  };

  // Drag and drop
  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIndex !== null && dragIndex !== idx) {
      setBlocks((prev) => {
        const arr = [...prev];
        const [removed] = arr.splice(dragIndex, 1);
        arr.splice(idx, 0, removed);
        return arr;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!title || !slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }

    const pageData = {
      title,
      slug,
      status,
      template,
      content: blocks,
      meta_title: metaTitle || null,
      meta_description: metaDesc || null,
      meta_keywords: metaKeywords || null,
      og_image: ogImage || null,
    };

    try {
      if (isNew) {
        const page = await createMutation.mutateAsync(pageData);
        toast({ title: "Page created" });
        navigate(`/admin/pages/${page.id}`, { replace: true });
      } else {
        await updateMutation.mutateAsync({ id: id!, ...pageData });
        toast({ title: "Page saved" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (!isNew && isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground flex-1 truncate">
          {isNew ? "New Page" : title || "Edit Page"}
        </h1>
      </div>

      {/* Toolbar */}
      <BlockToolbar
        onAddElement={() => setPickerOpen(true)}
        onSave={handleSave}
        saving={saving}
        slug={slug}
        onPreview={slug ? () => window.open(`/${slug}`, "_blank") : undefined}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Content panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full overflow-y-auto p-6 bg-muted/20">
              {/* Page Title input */}
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter title here"
                className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-primary outline-none pb-2 mb-6 text-foreground placeholder:text-muted-foreground/50 transition-colors"
              />

              {/* Blocks canvas */}
              <div className="space-y-1 min-h-[200px]">
                {blocks.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-lg py-16 text-center">
                    <p className="text-muted-foreground text-sm mb-3">No content blocks yet.</p>
                    <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                      Add your first element
                    </Button>
                  </div>
                )}

                {blocks.map((block, idx) => {
                  const isDragging = dragIndex === idx;
                  const isDragOver = dragOverIndex === idx;
                  return (
                    <InlineBlock
                      key={block.id}
                      block={block}
                      isDragging={isDragging}
                      isDragOver={isDragOver}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => openBlockSettings(block)}
                      onDuplicate={() => duplicateBlock(block)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  );
                })}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right sidebar */}
          <ResizablePanel defaultSize={30} minSize={22} maxSize={40}>
            <div className="h-full overflow-y-auto p-4 bg-card space-y-3">
              {/* Publish metabox */}
              <SidebarMetabox title="Publish" open={publishOpen} onToggle={() => setPublishOpen(!publishOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {slug && (
                    <Button variant="ghost" size="sm" className="text-xs gap-1 w-full justify-start text-muted-foreground" onClick={() => window.open(`/${slug}`, "_blank")}>
                      <Eye className="h-3 w-3" /> Preview: /{slug}
                    </Button>
                  )}
                </div>
              </SidebarMetabox>

              {/* Page Attributes metabox */}
              <SidebarMetabox title="Page Attributes" open={attrsOpen} onToggle={() => setAttrsOpen(!attrsOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Slug</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">/</span>
                      <Input
                        value={slug}
                        onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                        placeholder="page-slug"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Template</Label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="full-width">Full Width</SelectItem>
                        <SelectItem value="landing">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SidebarMetabox>

              {/* SEO metabox */}
              <SidebarMetabox title="SEO" open={seoOpen} onToggle={() => setSeoOpen(!seoOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Title</Label>
                    <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" className="h-8 text-xs" />
                    <p className="text-[10px] text-muted-foreground">{metaTitle.length}/60</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Description</Label>
                    <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="SEO description" rows={2} className="text-xs" />
                    <p className="text-[10px] text-muted-foreground">{metaDesc.length}/160</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Keywords</Label>
                    <Input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2" className="h-8 text-xs" />
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label className="text-xs">OG Image URL</Label>
                    <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
                  </div>

                  {/* Mini search preview */}
                  <div className="border rounded p-3 bg-muted/30 space-y-0.5">
                    <p className="text-primary text-xs font-medium truncate">{metaTitle || title || "Page Title"}</p>
                    <p className="text-[10px] text-primary/70 truncate">yoursite.com/{slug || "page-slug"}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{metaDesc || "No meta description set."}</p>
                  </div>
                </div>
              </SidebarMetabox>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Element picker */}
      <ElementPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addBlock} />

      {/* Block settings slide-over */}
      <BlockSettingsPanel
        block={editingBlock}
        open={settingsPanelOpen}
        onClose={() => { setSettingsPanelOpen(false); setEditingBlock(null); }}
        onUpdate={updateBlock}
      />
    </div>
  );
}

/* ─── Sidebar Metabox ─────────────────────────────── */

function SidebarMetabox({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <div className="border rounded-md bg-card overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-foreground bg-muted/40 hover:bg-muted/60 transition-colors">
          {title}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 py-3">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* ─── Inline Block (WPBakery-style) ───────────────── */

function InlineBlock({
  block,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  block: ContentBlock;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isComponent = block.type === "component";
  const componentName = isComponent ? (block.data.component as string) : null;
  const schema = componentName ? getComponentSchema(componentName) : null;

  const Icon = BLOCK_ICON_MAP[block.type] || Settings2;
  const label = isComponent
    ? (schema?.label || componentName || "Component")
    : block.type.charAt(0).toUpperCase() + block.type.slice(1);

  // Preview content
  const renderPreview = () => {
    switch (block.type) {
      case "heading": {
        const text = (block.data.text as string) || "Empty heading";
        const level = (block.data.level as string) || "h2";
        const sizes: Record<string, string> = { h1: "text-2xl", h2: "text-xl", h3: "text-lg", h4: "text-base" };
        return <div className={`${sizes[level] || "text-xl"} font-bold text-foreground`} dangerouslySetInnerHTML={{ __html: text }} />;
      }
      case "paragraph": {
        const text = (block.data.text as string) || "Empty paragraph";
        return <div className="text-sm text-foreground/80 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: text }} />;
      }
      case "image": {
        const url = block.data.url as string;
        return url ? (
          <img src={url} alt={(block.data.alt as string) || ""} className="max-h-32 rounded object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground italic">No image set</span>
        );
      }
      case "html":
        return <code className="text-xs text-muted-foreground line-clamp-2 font-mono">{(block.data.code as string) || "Empty HTML"}</code>;
      case "spacer":
        return <div className="text-xs text-muted-foreground">↕ {(block.data.height as number) || 40}px</div>;
      case "component":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{label}</span>
            {schema && schema.fields.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({Object.keys(block.data).filter(k => k !== "component").length} props)
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative group rounded-md transition-all cursor-default
        ${isDragging ? "opacity-40" : ""}
        ${isDragOver ? "border-2 border-dashed border-primary bg-primary/5" : "border border-transparent hover:border-dashed hover:border-border"}
      `}
    >
      {/* Floating controls on hover */}
      {hovered && !isDragging && (
        <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm px-1 py-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <GripVertical className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Duplicate" onClick={onDuplicate}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" title="Delete" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Block content */}
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
