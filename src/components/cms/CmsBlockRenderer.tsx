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
 * Renders an array of CMS content blocks.
 * - "component" blocks look up the React component from the registry.
 * - Standard blocks (heading, paragraph, image, html, spacer) render directly.
 */
export function CmsBlockRenderer({ blocks }: CmsBlockRendererProps) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => (
        <CmsBlock key={block.id} block={block} />
      ))}
    </>
  );
}

function CmsBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "component": {
      const name = block.data.component as string;
      const Component = getRegisteredComponent(name);
      if (!Component) {
        console.warn(`CMS: Unknown component "${name}"`);
        return null;
      }
      // Pass any extra data fields as props (excluding 'component')
      const { component: _, ...props } = block.data;
      return <Component {...props} />;
    }

    case "heading": {
      const Tag = (block.data.level as string) || "h2";
      const HeadingTag = Tag as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag className="text-3xl font-bold text-foreground">
          {block.data.text as string}
        </HeadingTag>
      );
    }

    case "paragraph":
      return (
        <p className="text-muted-foreground">
          {block.data.text as string}
        </p>
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
