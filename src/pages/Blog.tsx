import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, User, Tag, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { usePublicPosts } from "@/hooks/usePublicPosts";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined
  );

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);
  const { data, isLoading } = usePublicPosts(selectedCategory);
  const posts = data?.posts || [];
  const categories = data?.categories || [];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, strategies, and insights to grow your local business presence.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main post list */}
          <div className="flex-1 space-y-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-6 animate-pulse">
                  <Skeleton className="w-48 h-32 rounded-lg shrink-0 hidden sm:block" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No posts published yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new content!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="group flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  {post.featured_image ? (
                    <Link to={`/blog/${post.slug}`} className="shrink-0">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full sm:w-48 h-32 object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </Link>
                  ) : (
                    <div className="shrink-0 w-full sm:w-48 h-32 bg-muted rounded-lg hidden sm:flex items-center justify-center">
                      <span className="text-muted-foreground/40 text-4xl font-bold">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author.name || post.author.email}
                        </span>
                      )}
                      {post.category && (
                        <Badge variant="outline" className="text-[10px] py-0">{post.category.name}</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {post.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-[10px] py-0">{tag.name}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Read more */}
                    <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-3">
                      Read more <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCategory(undefined); setSearchParams({}); }}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-testid="button-category-all"
                  >
                    All Posts
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSearchParams({ category: cat.id }); }}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                        selectedCategory === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-category-${cat.id}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
                <h3 className="text-base font-semibold text-foreground mb-2">Ready to grow your local business?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize your Google Business Profile with GMB Briefcase.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/pricing" data-testid="link-sidebar-cta">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
