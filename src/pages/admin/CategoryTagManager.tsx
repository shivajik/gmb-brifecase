import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCmsCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCmsTags, useCreateTag, useDeleteTag, generateSlug,
} from "@/hooks/useCmsPosts";
import { useToast } from "@/hooks/use-toast";

function CategoriesTab() {
  const { data: categories, isLoading } = useCmsCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const resetForm = () => { setName(""); setSlug(""); setDescription(""); setEditId(null); };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateCat.mutateAsync({ id: editId, name, slug, description });
        toast({ title: "Category updated" });
      } else {
        await createCat.mutateAsync({ name, slug, description });
        toast({ title: "Category created" });
      }
      resetForm();
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    }
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Organize your blog posts into categories</p>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "New"} Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); if (!editId) setSlug(generateSlug(e.target.value)); }} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={!name || !slug}>
                {editId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : !categories || categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No categories yet</TableCell></TableRow>
            ) : categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cat.description || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>Posts in this category will become uncategorized.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCat.mutateAsync(cat.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TagsTab() {
  const { data: tags, isLoading } = useCmsTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    try {
      await createTag.mutateAsync({ name, slug });
      toast({ title: "Tag created" });
      setName(""); setSlug(""); setDialogOpen(false);
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Add tags to organize and filter posts</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Tag</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(generateSlug(e.target.value)); }} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!name || !slug}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !tags || tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags yet</p>
        ) : tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
            {tag.name}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete tag "{tag.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>This will remove the tag from all posts.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteTag.mutateAsync(tag.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function CategoryTagManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories & Tags</h1>
        <p className="text-sm text-muted-foreground">Manage blog taxonomies</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="tags" className="mt-4">
          <TagsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
