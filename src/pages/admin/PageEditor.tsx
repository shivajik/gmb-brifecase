import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useCmsPage, useCreatePage, useUpdatePage, generateSlug, type ContentBlock } from "@/hooks/useCmsPages";
import { useToast } from "@/hooks/use-toast";

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: "H" },
  { type: "paragraph", label: "Paragraph", icon: "¶" },
  { type: "image", label: "Image", icon: "🖼" },
  { type: "html", label: "HTML", icon: "</>" },
  { type: "spacer", label: "Spacer", icon: "—" },
] as const;

function newBlock(type: ContentBlock["type"]): ContentBlock {
  const id = crypto.randomUUID();
  const defaults: Record<string, Record<string, unknown>> = {
    heading: { text: "", level: "h2" },
    paragraph: { text: "" },
    image: { url: "", alt: "", caption: "" },
    html: { code: "" },
    spacer: { height: 40 },
  };
  return { id, type, data: defaults[type] || {} };
}

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

  const addBlock = (type: ContentBlock["type"]) => {
    setBlocks((prev) => [...prev, newBlock(type)]);
  };

  const updateBlock = (blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)));
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{isNew ? "New Page" : "Edit Page"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/</span>
                  <Input
                    value={slug}
                    onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                    placeholder="page-slug"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Content Blocks</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" /> Add Block
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {BLOCK_TYPES.map((bt) => (
                      <DropdownMenuItem key={bt.type} onClick={() => addBlock(bt.type)}>
                        <span className="w-6 text-center mr-2 font-mono text-xs">{bt.icon}</span>
                        {bt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {blocks.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-6">
                  No content blocks yet. Click "Add Block" to start building your page.
                </p>
              )}
              {blocks.map((block, idx) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  index={idx}
                  total={blocks.length}
                  onUpdate={(data) => updateBlock(block.id, data)}
                  onRemove={() => removeBlock(block.id)}
                  onMove={(dir) => moveBlock(idx, dir)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Override page title for search engines" />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Brief description for search results" rows={3} />
                <p className="text-xs text-muted-foreground">{metaDesc.length}/160 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/30 space-y-1">
                <p className="text-primary text-sm font-medium truncate">
                  {metaTitle || title || "Page Title"}
                </p>
                <p className="text-xs text-primary/70 truncate">
                  yoursite.com/{slug || "page-slug"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {metaDesc || "No meta description set. Search engines will auto-generate a snippet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlockEditor({
  block,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  onUpdate: (data: Record<string, unknown>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const label = BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type;

  return (
    <div className="border rounded-lg bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 rounded-t-lg">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex-1">{label}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => onMove(-1)}>
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-3">
        {block.type === "heading" && (
          <div className="space-y-2">
            <Select value={(block.data.level as string) || "h2"} onValueChange={(v) => onUpdate({ level: v })}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
              </SelectContent>
            </Select>
            <Input value={(block.data.text as string) || ""} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Heading text" />
          </div>
        )}
        {block.type === "paragraph" && (
          <Textarea value={(block.data.text as string) || ""} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Paragraph text..." rows={4} />
        )}
        {block.type === "image" && (
          <div className="space-y-2">
            <Input value={(block.data.url as string) || ""} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="Image URL" />
            <Input value={(block.data.alt as string) || ""} onChange={(e) => onUpdate({ alt: e.target.value })} placeholder="Alt text" />
            <Input value={(block.data.caption as string) || ""} onChange={(e) => onUpdate({ caption: e.target.value })} placeholder="Caption (optional)" />
          </div>
        )}
        {block.type === "html" && (
          <Textarea
            value={(block.data.code as string) || ""}
            onChange={(e) => onUpdate({ code: e.target.value })}
            placeholder="<div>Custom HTML...</div>"
            rows={6}
            className="font-mono text-sm"
          />
        )}
        {block.type === "spacer" && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">Height (px)</Label>
            <Input
              type="number"
              value={(block.data.height as number) || 40}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 40 })}
              className="w-24"
            />
          </div>
        )}
      </div>
    </div>
  );
}
