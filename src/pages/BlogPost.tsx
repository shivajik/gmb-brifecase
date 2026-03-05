import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { usePublicPost, usePublicPosts } from "@/hooks/usePublicPosts";
import { CmsBlockRenderer } from "@/components/cms/CmsBlockRenderer";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let idx = 0;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text) {
      items.push({ id: `heading-${idx}`, text, level: parseInt(match[1]) });
      idx++;
    }
  }
  return items;
}

function injectHeadingIds(html: string, tocItems: TocItem[]): string {
  let idx = 0;
  return html.replace(/<h([2-3])([^>]*)>/gi, (match, level, attrs) => {
    if (idx < tocItems.length) {
      const id = tocItems[idx].id;
      idx++;
      if (attrs.includes('id=')) return match;
      return `<h${level}${attrs} id="${id}">`;
    }
    return match;
  });
}

function transformFaqsToAccordion(container: HTMLElement) {
  const headings = container.querySelectorAll('h2, h3, h4');
  let faqSectionStart: Element | null = null;

  headings.forEach((heading) => {
    const text = heading.textContent?.trim().toLowerCase() || '';
    if (text.includes('faq') || text.includes('frequently asked question') || text.includes('frequently asked questions')) {
      faqSectionStart = heading;
    }
  });

  if (!faqSectionStart) return;

  const faqItems: { question: string; answer: string[] }[] = [];
  let current: { question: string; answer: string[] } | null = null;
  let sibling = (faqSectionStart as Element).nextElementSibling;

  while (sibling) {
    const tag = sibling.tagName.toLowerCase();
    const text = sibling.textContent?.trim() || '';

    if (tag === 'h2' && !text.toLowerCase().includes('faq') && !text.match(/^q\d/i)) break;

    if ((tag === 'h3' || tag === 'h4') && text.match(/^q\d/i)) {
      if (current) faqItems.push(current);
      current = { question: text.replace(/^q\d+\.\s*/i, ''), answer: [] };
    } else if (current && (tag === 'p' || tag === 'ul' || tag === 'ol')) {
      let html = sibling.innerHTML;
      html = html.replace(/^<strong>Ans:?\s*<\/strong>:?\s*/i, '');
      html = html.replace(/^<span[^>]*><strong>Ans:?\s*<\/strong>:?\s*/i, '<span>');
      current.answer.push(html);
    }
    sibling = sibling.nextElementSibling;
  }
  if (current && current.answer.length > 0) faqItems.push(current);

  if (faqItems.length === 0) return;

  let toRemove = (faqSectionStart as Element).nextElementSibling;
  const elementsToRemove: Element[] = [];
  while (toRemove) {
    const tag = toRemove.tagName.toLowerCase();
    const text = toRemove.textContent?.trim() || '';
    if (tag === 'h2' && !text.toLowerCase().includes('faq') && !text.match(/^q\d/i)) break;
    if ((tag === 'h3' || tag === 'h4') && text.match(/^q\d/i)) {
      elementsToRemove.push(toRemove);
    } else if (elementsToRemove.length > 0 && (tag === 'p' || tag === 'ul' || tag === 'ol')) {
      elementsToRemove.push(toRemove);
    }
    toRemove = toRemove.nextElementSibling;
  }

  const accordion = document.createElement('div');
  accordion.className = 'faq-accordion not-prose space-y-3 my-6';
  accordion.setAttribute('data-testid', 'faq-accordion');

  faqItems.forEach((item, idx) => {
    const details = document.createElement('details');
    details.className = 'faq-item group rounded-lg border border-border bg-card overflow-hidden';
    details.setAttribute('data-testid', `faq-item-${idx}`);

    const summary = document.createElement('summary');
    summary.className = 'flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-foreground font-medium text-base hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden';
    summary.innerHTML = `<span>${item.question}</span><svg class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

    const content = document.createElement('div');
    content.className = 'px-5 pb-4 text-muted-foreground text-sm leading-relaxed border-t border-border pt-3';
    content.innerHTML = item.answer.map(a => `<p class="mb-2 last:mb-0">${a}</p>`).join('');

    details.appendChild(summary);
    details.appendChild(content);
    accordion.appendChild(details);
  });

  elementsToRemove.forEach(el => el.remove());

  (faqSectionStart as Element).insertAdjacentElement('afterend', accordion);
}

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePublicPost(slug);
  const { data: sidebarData, isLoading: sidebarLoading } = usePublicPosts(undefined, 50);
  const contentRef = useRef<HTMLDivElement>(null);

  const categories = sidebarData?.categories || [];
  const recentPosts = (sidebarData?.posts || [])
    .filter((p) => p.slug !== slug)
    .slice(0, 5);

  useEffect(() => {
    if (contentRef.current && post) {
      transformFaqsToAccordion(contentRef.current);
    }
  }, [post, slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-not-found">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or isn't published yet.</p>
          <Button asChild>
            <Link to="/blog" data-testid="link-back-to-blog"><ArrowLeft className="mr-2 h-4 w-4" />Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const contentBlocks = (post.content as any[]) || [];
  const isSimple = post.editor_mode === "simple";
  let simpleHtml =
    isSimple && contentBlocks.length > 0
      ? contentBlocks[0]?.data?.text || ""
      : "";

  const tocItems = isSimple ? extractToc(simpleHtml) : [];
  if (isSimple && tocItems.length > 0) {
    simpleHtml = injectHeadingIds(simpleHtml, tocItems);
  }

  return (
    <Layout>
      <article>
        <header className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6" data-testid="link-back-to-blog">
              <ArrowLeft className="h-3 w-3" />Back to Blog
            </Link>

            {post.category && (
              <Link to={`/blog?category=${post.category.id}`}>
                <Badge variant="outline" className="mb-3 hover:bg-primary/10 cursor-pointer" data-testid="badge-category">{post.category.name}</Badge>
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight" data-testid="text-post-title">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {post.published_at && (
                <span className="flex items-center gap-1.5" data-testid="text-published-date">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5" data-testid="text-author">
                  <User className="h-4 w-4" />
                  {post.author.name || post.author.email}
                </span>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" data-testid={`badge-tag-${tag.id}`}>{tag.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        {post.featured_image && (
          <div className="container mx-auto max-w-6xl px-4 -mt-2 mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
              data-testid="img-featured"
            />
          </div>
        )}

        <div className="container mx-auto max-w-6xl px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 min-w-0" ref={contentRef}>
              {isSimple ? (
                <div
                  className="prose prose-lg max-w-none text-foreground
                    prose-headings:text-foreground prose-p:text-muted-foreground
                    prose-a:text-primary prose-strong:text-foreground
                    prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: simpleHtml }}
                  data-testid="content-simple"
                />
              ) : (
                <CmsBlockRenderer blocks={post.content as any[]} />
              )}
            </div>

            <aside className="w-full lg:w-72 shrink-0" data-testid="sidebar">
            <div className="lg:sticky lg:top-20 space-y-6">
              {tocItems.length > 2 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm transition-colors hover:text-primary ${
                          item.level === 3 ? "pl-4 text-muted-foreground" : "text-foreground font-medium"
                        } py-1 border-l-2 border-transparent hover:border-primary pl-3`}
                        data-testid={`toc-${item.id}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {categories.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
                  <div className="space-y-1">
                    <Link
                      to="/blog"
                      className="block w-full text-left text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      data-testid="link-category-all"
                    >
                      All Posts
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/blog?category=${cat.id}`}
                        className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                          post.category?.id === cat.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        data-testid={`link-category-${cat.id}`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-default"
                        data-testid={`sidebar-tag-${tag.id}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {recentPosts.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Recent Posts</h3>
                  <div className="space-y-3">
                    {recentPosts.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`/blog/${rp.slug}`}
                        className="group block"
                        data-testid={`link-recent-post-${rp.id}`}
                      >
                        <div className="flex items-start gap-3">
                          {rp.featured_image ? (
                            <img
                              src={rp.featured_image}
                              alt={rp.title}
                              className="w-16 h-12 object-cover rounded shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded shrink-0 flex items-center justify-center">
                              <span className="text-muted-foreground/40 text-sm font-bold">{rp.title.charAt(0)}</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {rp.title}
                            </p>
                            {rp.published_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(rp.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
                <h3 className="text-base font-semibold text-foreground mb-2">Ready to grow your local business?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize your Google Business Profile with GMB Briefcase.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/pricing" data-testid="link-sidebar-cta">Start Free Trial</Link>
                </Button>
              </div>

              {sidebarLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
            </div>
            </aside>
          </div>
        </div>
      </article>
    </Layout>
  );
}
