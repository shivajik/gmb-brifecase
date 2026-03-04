import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { usePublicPost } from "@/hooks/usePublicPosts";
import { CmsBlockRenderer } from "@/components/cms/CmsBlockRenderer";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePublicPost(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-16 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or isn't published yet.</p>
          <Button asChild>
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

const contentBlocks = (post.content as any[]) || [];

const isSimple = post.editor_mode === "simple";

const simpleHtml =
  isSimple && contentBlocks.length > 0
    ? contentBlocks[0]?.data?.text || ""
    : "";
    
  return (
    <Layout>
      {/* Article header */}
      <article>
        <header className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-3 w-3" />Back to Blog
            </Link>

            {/* Category */}
            {post.category && (
              <Badge variant="outline" className="mb-3">{post.category.name}</Badge>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name || post.author.email}
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.featured_image && (
          <div className="container mx-auto max-w-4xl px-4 -mt-2 mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto max-w-3xl px-4 pb-16">
          {isSimple ? (
            <div
              className="prose prose-lg max-w-none text-foreground
                prose-headings:text-foreground prose-p:text-muted-foreground
                prose-a:text-primary prose-strong:text-foreground
                prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: simpleHtml }}
            />
          ) : (
            <CmsBlockRenderer blocks={post.content as any[]} />
          )}
        </div>
      </article>
    </Layout>
  );
}
