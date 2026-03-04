import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Plus, Pencil, Trash2, GripVertical, Copy, Settings2, Type, Pilcrow, Image, Code, Minus, ChevronDown, ChevronUp, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "@/components/ui/resizable";

import { BlockToolbar } from "@/components/admin/BlockToolbar";
import { ElementPickerModal } from "@/components/admin/ElementPickerModal";
import { BlockSettingsPanel } from "@/components/admin/BlockSettingsPanel";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { RowBlockEditor } from "@/components/admin/RowBlockEditor";
import { type ContentBlock, type ColumnData, ROW_LAYOUTS } from "@/hooks/useCmsPages";
import {
  useCmsPost, useCreatePost, useUpdatePost,
  useCmsCategories, useCmsTags, generateSlug,
} from "@/hooks/useCmsPosts";
import { useToast } from "@/hooks/use-toast";
import { getComponentSchema } from "@/components/cms/ComponentPropSchemas";

function newBlock(type: ContentBlock["type"], componentName?: string): ContentBlock {
  const id = crypto.randomUUID();
  if (type === "row") {
    const defaultLayout = "6-6";
    const preset = ROW_LAYOUTS.find((l) => l.value === defaultLayout)!;
    const columns: ColumnData[] = preset.columns.map((span) => ({
      id: crypto.randomUUID(), span, blocks: [],
    }));
    return { id, type: "row", data: { layout: defaultLayout, columns } };
  }
  const defaults: Record<string, Record<string, unknown>> = {
    heading: { text: "", level: "h2" },
    paragraph: { text: "" },
    image: { src: "", alt: "" },
    html: { code: "" },
    spacer: { height: 40 },
  };
  if (type === "component" && componentName) {
    const schema = getComponentSchema(componentName);
    const defaultProps: Record<string, unknown> = {};
    if (schema && schema.fields) {
      schema.fields.forEach((field) => {
        if (field.defaultValue !== undefined) defaultProps[field.key] = field.defaultValue;
      });
    }
    return { id, type: "component", data: { componentName, props: defaultProps } };
  }
  return { id, type, data: defaults[type] || {} };
}

const BLOCK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  heading: Type,
  paragraph: Pilcrow,
  image: Image,
  html: Code,
  spacer: Minus,
  component: Settings2,
  row: Columns,
};

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
          <div className="px-3 py-3">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* ─── Inline Block ─────────────────────────────────── */
function InlineBlock({
  block, isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onEdit, onDuplicate, onRemove, onUpdate, onOpenChildSettings,
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
  onUpdate: (data: Record<string, unknown>) => void;
  onOpenChildSettings: (childBlock: ContentBlock) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isComponent = block.type === "component";
  const isRow = block.type === "row";
  const isTextBlock = block.type === "heading" || block.type === "paragraph";
  const componentName = isComponent ? (block.data.componentName as string) : null;
  const schema = componentName ? getComponentSchema(componentName) : null;
  const Icon = BLOCK_ICON_MAP[block.type] || Settings2;
  const label = isComponent ? (schema?.label || componentName || "Component") : block.type.charAt(0).toUpperCase() + block.type.slice(1);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative group rounded-md border transition-all ${
        isDragging ? "opacity-40 border-primary" :
        isDragOver ? "border-primary border-dashed bg-primary/5" :
        hovered ? "border-primary/40 shadow-sm" :
        "border-transparent hover:border-border"
      }`}
    >
      {/* Floating toolbar */}
      {hovered && !isDragging && (
        <div className="absolute -top-3 left-2 flex items-center gap-0.5 bg-card border rounded-md shadow-sm px-1 py-0.5 z-10">
          <div className="cursor-grab px-1" title="Drag to reorder"><GripVertical className="h-3 w-3 text-muted-foreground" /></div>
          <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
            <Icon className="h-3 w-3" />{label}
          </span>
          <Separator orientation="vertical" className="h-3 mx-0.5" />
          {(isComponent || isRow) && (
            <button onClick={onEdit} className="p-0.5 rounded hover:bg-muted" title="Settings"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
          )}
          <button onClick={onDuplicate} className="p-0.5 rounded hover:bg-muted" title="Duplicate"><Copy className="h-3 w-3 text-muted-foreground" /></button>
          <button onClick={onRemove} className="p-0.5 rounded hover:bg-destructive/10" title="Remove"><Trash2 className="h-3 w-3 text-destructive" /></button>
        </div>
      )}

      <div className="p-3">
        {isTextBlock ? (
          block.type === "heading" ? (
            <div className="space-y-2">
              <Select value={(block.data.level as string) || "h2"} onValueChange={(v) => onUpdate({ level: v })}>
                <SelectTrigger className="h-7 w-20 text-xs border-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem><SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem><SelectItem value="h4">H4</SelectItem>
                </SelectContent>
              </Select>
              <RichTextEditor value={(block.data.text as string) || ""} onChange={(val) => onUpdate({ text: val })} placeholder="Enter heading..." minHeight={50} />
            </div>
          ) : (
            <RichTextEditor value={(block.data.text as string) || ""} onChange={(val) => onUpdate({ text: val })} placeholder="Start writing..." minHeight={100} />
          )
        ) : block.type === "image" ? (
          block.data.src ? <img src={block.data.src as string} alt="" className="max-h-40 rounded object-contain" /> :
          <span className="text-xs text-muted-foreground italic">No image — click Edit</span>
        ) : block.type === "html" ? (
          <code className="text-xs text-muted-foreground line-clamp-3 font-mono">{(block.data.code as string) || "Empty HTML"}</code>
        ) : block.type === "spacer" ? (
          <div className="text-xs text-muted-foreground">↕ Spacer: {(block.data.height as number) || 40}px</div>
        ) : isComponent ? (
          <div className="border border-dashed rounded-lg p-3 bg-muted/30 text-center text-sm text-muted-foreground cursor-pointer" onClick={onEdit}>
            <Settings2 className="h-5 w-5 mx-auto mb-1 text-primary" />{label}
          </div>
        ) : isRow ? (
          <RowBlockEditor
            columns={(block.data.columns as ColumnData[]) || []}
            layout={(block.data.layout as string) || "12"}
            onUpdate={onUpdate}
            onOpenBlockSettings={(childBlock) => onOpenChildSettings(childBlock)}
          />
        ) : null}
      </div>
    </div>
  );
}

/* ─── Post Editor ──────────────────────────────────── */
export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id || id === "new";

  const { data: post, isLoading } = useCmsPost(isNew ? undefined : id);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { data: categories } = useCmsCategories();
  const { data: tags } = useCmsTags();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editorMode, setEditorMode] = useState<"simple" | "builder">("simple");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Simple mode
  const [simpleContent, setSimpleContent] = useState("");

  // Builder mode
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sidebar state
  const [publishOpen, setPublishOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(true);
  const [taxonomyOpen, setTaxonomyOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setSlugManual(true);
      setExcerpt(post.excerpt || "");
      setFeaturedImage(post.featured_image || "");
      setStatus(post.status);
      setEditorMode(post.editor_mode);
      setCategoryId(post.category_id || "");
      setSelectedTagIds(post.tag_ids || []);
      setMetaTitle(post.meta_title || "");
      setMetaDescription(post.meta_description || "");

      if (post.editor_mode === "simple") {
        const textBlock = (post.content || []).find((b: ContentBlock) => b.type === "paragraph");
        setSimpleContent((textBlock?.data?.text as string) || "");
      } else {
        setBlocks(Array.isArray(post.content) ? post.content : []);
      }
    }
  }, [post]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(generateSlug(val));
  };

  const getContentForSave = (): ContentBlock[] => {
    if (editorMode === "simple") {
      return [{ id: "simple-content", type: "paragraph", data: { text: simpleContent } }];
    }
    return blocks;
  };

  // Block operations
  const addBlock = (type: string, componentName?: string) => {
    setBlocks((prev) => [...prev, newBlock(type as ContentBlock["type"], componentName)]);
  };

  const updateBlock = (blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)));
    if (editingBlock?.id === blockId) {
      setEditingBlock((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : prev);
    }
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (editingBlock?.id === blockId) { setEditingBlock(null); setSettingsPanelOpen(false); }
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
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIndex(idx); };
  const handleDrop = (idx: number) => {
    if (dragIndex !== null && dragIndex !== idx) {
      setBlocks((prev) => { const arr = [...prev]; const [r] = arr.splice(dragIndex, 1); arr.splice(idx, 0, r); return arr; });
    }
    setDragIndex(null); setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  const handleSave = async () => {
    if (!title || !slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        title, slug,
        excerpt: excerpt || null,
        content: getContentForSave(),
        featured_image: featuredImage || null,
        status, editor_mode: editorMode,
        category_id: categoryId || null,
        tag_ids: selectedTagIds,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
      };
      if (isNew) {
        const created = await createPost.mutateAsync(payload);
        toast({ title: "Post created" });
        navigate(`/admin/posts/${created.id}`, { replace: true });
      } else {
        await updatePost.mutateAsync({ id, ...payload });
        toast({ title: "Post saved" });
      }
    } catch (e: any) {
      toast({ title: e.message || "Error saving", variant: "destructive" });
    }
  };

  const saving = createPost.isPending || updatePost.isPending;

  if (!isNew && isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/posts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-base font-semibold text-foreground flex-1 truncate">
          {isNew ? "New Post" : title || "Edit Post"}
        </h1>
        <div className="flex items-center gap-2">
          <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as "simple" | "builder")}>
            <TabsList className="h-8">
              <TabsTrigger value="simple" className="text-xs h-7">Simple</TabsTrigger>
              <TabsTrigger value="builder" className="text-xs h-7">Page Builder</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Toolbar (only for builder mode) */}
      {editorMode === "builder" && (
        <BlockToolbar
          onAddElement={() => setPickerOpen(true)}
          onSave={handleSave}
          saving={saving}
          slug={slug ? `blog/${slug}` : undefined}
          onPreview={slug ? () => window.open(`/blog/${slug}`, "_blank") : undefined}
        />
      )}

      {/* Simple mode: save bar */}
      {editorMode === "simple" && (
        <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 bg-card border-b border-border shadow-sm">
          <div className="flex-1" />
          {slug && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => window.open(`/blog/${slug}`, "_blank")}>
              <Eye className="h-4 w-4" />Preview
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full overflow-y-auto p-6 bg-muted/20">
              {/* Title */}
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
                className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-primary outline-none pb-2 mb-6 text-foreground placeholder:text-muted-foreground/50 transition-colors"
              />

              {editorMode === "simple" ? (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={simpleContent}
                    onChange={setSimpleContent}
                    placeholder="Write your blog post content here..."
                    minHeight={400}
                  />
                </div>
              ) : (
                <div className="space-y-1 min-h-[200px]">
                  {blocks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg py-16 text-center">
                      <p className="text-muted-foreground text-sm mb-3">No content blocks yet.</p>
                      <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                        Add your first element
                      </Button>
                    </div>
                  )}
                  {blocks.map((block, idx) => (
                    <InlineBlock
                      key={block.id}
                      block={block}
                      isDragging={dragIndex === idx}
                      isDragOver={dragOverIndex === idx}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => openBlockSettings(block)}
                      onDuplicate={() => duplicateBlock(block)}
                      onRemove={() => removeBlock(block.id)}
                      onUpdate={(data) => updateBlock(block.id, data)}
                      onOpenChildSettings={(childBlock) => openBlockSettings(childBlock)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right sidebar */}
          <ResizablePanel defaultSize={30} minSize={22} maxSize={40}>
            <div className="h-full overflow-y-auto p-4 bg-card space-y-3">
              {/* Publish */}
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
                  <div className="space-y-1.5">
                    <Label className="text-xs">Slug</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">/blog/</span>
                      <Input
                        value={slug}
                        onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                        placeholder="post-slug"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </SidebarMetabox>

              {/* Featured Image & Excerpt */}
              <SidebarMetabox title="Featured Image & Excerpt" open={mediaOpen} onToggle={() => setMediaOpen(!mediaOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Featured Image URL</Label>
                    <Input
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://..."
                      className="h-8 text-xs"
                    />
                    {featuredImage && (
                      <img src={featuredImage} alt="Featured" className="w-full h-24 object-cover rounded" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Excerpt</Label>
                    <Textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      placeholder="Brief summary..."
                      className="text-xs"
                    />
                  </div>
                </div>
              </SidebarMetabox>

              {/* Category & Tags */}
              <SidebarMetabox title="Category & Tags" open={taxonomyOpen} onToggle={() => setTaxonomyOpen(!taxonomyOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {(categories || []).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tags</Label>
                    <div className="flex flex-wrap gap-1">
                      {(tags || []).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer text-[10px]"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {(!tags || tags.length === 0) && (
                        <p className="text-[10px] text-muted-foreground">No tags yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </SidebarMetabox>

              {/* SEO */}
              <SidebarMetabox title="SEO" open={seoOpen} onToggle={() => setSeoOpen(!seoOpen)}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Title</Label>
                    <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Description</Label>
                    <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className="text-xs" />
                  </div>
                  <div className="border rounded p-3 bg-muted/30 space-y-0.5">
                    <p className="text-primary text-xs font-medium truncate">{metaTitle || title || "Post Title"}</p>
                    <p className="text-[10px] text-primary/70 truncate">yoursite.com/blog/{slug || "post-slug"}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{metaDescription || "No meta description set."}</p>
                  </div>
                </div>
              </SidebarMetabox>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Element picker */}
      <ElementPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addBlock} />

      {/* Block settings */}
      <BlockSettingsPanel
        block={editingBlock}
        open={settingsPanelOpen}
        onClose={() => { setSettingsPanelOpen(false); setEditingBlock(null); }}
        onUpdate={updateBlock}
      />
    </div>
  );
}
