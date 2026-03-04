import { useState } from "react";
import { useCmsAuth } from "@/contexts/CmsAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BulkResult {
  title: string;
  slug: string;
  success: boolean;
  error?: string;
}

export default function BulkImport() {
  const { token } = useCmsAuth();
  const [jsonData, setJsonData] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkResult[]>([]);

  const handleImport = async () => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    let posts;
    try {
      posts = JSON.parse(jsonData);
      if (!Array.isArray(posts)) throw new Error("Must be an array");
    } catch (e) {
      toast.error("Invalid JSON. Must be an array of post objects.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("cms-posts", {
        body: { action: "bulk_create", posts },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data.results || []);
      toast.success(`Created ${data.created} posts, ${data.failed} failed`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Bulk Import Posts</h1>
      <p className="text-muted-foreground">
        Paste a JSON array of post objects. Each object needs: title, slug, excerpt, content (array of blocks), featured_image, status.
      </p>
      <Textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder='[{"title": "...", "slug": "...", "excerpt": "...", "content": [...], "status": "published"}]'
        className="min-h-[400px] font-mono text-xs"
      />
      <Button onClick={handleImport} disabled={loading || !jsonData.trim()}>
        {loading ? "Importing..." : "Import Posts"}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2 mt-4">
          <h2 className="text-lg font-semibold">Results ({results.filter(r => r.success).length} created, {results.filter(r => !r.success).length} failed)</h2>
          <div className="max-h-[400px] overflow-auto border rounded p-2 space-y-1 text-sm">
            {results.map((r, i) => (
              <div key={i} className={`p-2 rounded ${r.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {r.success ? "✅" : "❌"} {r.title} ({r.slug}) {r.error && `— ${r.error}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
