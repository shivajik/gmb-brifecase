import { THEME } from "@/config/themeSettings";
import { getRegisteredComponent } from "./ComponentRegistry";

export interface ContentBlock {
  id: string;
  type: "heading" | "paragraph" | "image" | "html" | "spacer" | "component";
  data: Record<string, unknown>;
}

interface CmsBlockRendererProps {
  blocks: ContentBlock[];
}

/**
 * Renders an array of CMS content blocks with theme-aware styling.
 * - First h1 heading gets "hero treatment" (gradient bg, centered, large text)
 * - Paragraphs immediately after the hero get subtitle styling
 * - Component blocks render via the registry unchanged
 * - Inline blocks are grouped into styled sections with alternating backgrounds
 */
export function CmsBlockRenderer({ blocks }: CmsBlockRendererProps) {
  if (!blocks?.length) return null;

  const rendered: React.ReactNode[] = [];
  let sectionIndex = 0;
  let heroRendered = false;

  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];

    // --- Component blocks render standalone ---
    if (block.type === "component") {
      rendered.push(<CmsBlock key={block.id} block={block} />);
      i++;
      continue;
    }

    // --- Hero detection: first h1 heading ---
    if (
      !heroRendered &&
      block.type === "heading" &&
      ((block.data.level as string) || "h2") === "h1"
    ) {
      heroRendered = true;
      // Collect subtitle paragraphs that follow the hero heading
      const subtitleBlocks: ContentBlock[] = [];
      let j = i + 1;
      while (
        j < blocks.length &&
        blocks[j].type === "paragraph"
      ) {
        subtitleBlocks.push(blocks[j]);
        j++;
      }

      rendered.push(
        <section
          key={`hero-${block.id}`}
          className={`${THEME.heroPadding} ${THEME.heroGradient}`}
        >
          <div className={THEME.heroContainer}>
            <h1
              className={THEME.heroHeading}
              dangerouslySetInnerHTML={{
                __html: (block.data.text as string) || "",
              }}
            />
            {subtitleBlocks.map((sb) => (
              <p
                key={sb.id}
                className={THEME.heroSubtitle}
                dangerouslySetInnerHTML={{
                  __html: (sb.data.text as string) || "",
                }}
              />
            ))}
          </div>
        </section>
      );

      i = j; // skip past subtitle paragraphs
      continue;
    }

    // --- Group consecutive inline blocks into a styled section ---
    const group: ContentBlock[] = [];
    while (i < blocks.length && blocks[i].type !== "component") {
      // Don't consume a future hero h1
      if (
        !heroRendered &&
        blocks[i].type === "heading" &&
        ((blocks[i].data.level as string) || "h2") === "h1" &&
        group.length > 0
      ) {
        break;
      }
      group.push(blocks[i]);
      i++;
    }

    if (group.length > 0) {
      const bg = THEME.sectionBg[sectionIndex % THEME.sectionBg.length];
      sectionIndex++;

      // Check if this group starts with a section heading (h2)
      const firstBlock = group[0];
      const isSection =
        firstBlock.type === "heading" &&
        ((firstBlock.data.level as string) || "h2") === "h2";

      rendered.push(
        <section
          key={`section-${group[0].id}`}
          className={`${THEME.sectionPadding} ${bg}`}
        >
          <div className={THEME.contentContainer}>
            {group.map((b, idx) => (
              <ThemedBlock
                key={b.id}
                block={b}
                isFirstInSection={idx === 0 && isSection}
                followsHeading={
                  idx === 1 &&
                  isSection &&
                  b.type === "paragraph"
                }
              />
            ))}
          </div>
        </section>
      );
    }
  }

  return <>{rendered}</>;
}

/** Renders a single block with theme-aware styles */
function ThemedBlock({
  block,
  isFirstInSection = false,
  followsHeading = false,
}: {
  block: ContentBlock;
  isFirstInSection?: boolean;
  followsHeading?: boolean;
}) {
  switch (block.type) {
    case "heading": {
      const level = (block.data.level as string) || "h2";
      const HeadingTag = level as keyof JSX.IntrinsicElements;
      const style = isFirstInSection
        ? THEME.sectionHeading
        : THEME.headingStyles[level] || THEME.headingStyles.h2;
      return (
        <HeadingTag
          className={style}
          dangerouslySetInnerHTML={{
            __html: (block.data.text as string) || "",
          }}
        />
      );
    }

    case "paragraph":
      return (
        <div
          className={
            followsHeading
              ? THEME.sectionSubtitle
              : "text-muted-foreground prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
          }
          dangerouslySetInnerHTML={{
            __html: (block.data.text as string) || "",
          }}
        />
      );

    case "image":
      return (
        <figure>
          <img
            src={block.data.url as string}
            alt={(block.data.alt as string) || ""}
            className="rounded-lg max-w-full"
            loading="lazy"
          />
          {block.data.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {block.data.caption as string}
            </figcaption>
          )}
        </figure>
      );

    case "html":
      return (
        <div
          dangerouslySetInnerHTML={{ __html: block.data.code as string }}
        />
      );

    case "spacer":
      return <div style={{ height: `${block.data.height || 40}px` }} />;

    default:
      return null;
  }
}

/** Legacy standalone block renderer for component type */
function CmsBlock({ block }: { block: ContentBlock }) {
  if (block.type !== "component") return null;
  const name = block.data.component as string;
  const Component = getRegisteredComponent(name);
  if (!Component) {
    console.warn(`CMS: Unknown component "${name}"`);
    return null;
  }
  const { component: _, ...props } = block.data;
  return <Component {...props} />;
}
