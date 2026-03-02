

## Plan: Add Rich Text Editor with HTML View to Content Blocks

### Problem
The paragraph and heading block editors currently use plain `<Input>` and `<Textarea>` components. The user wants a rich text editing experience with the ability to toggle to raw HTML view.

### Approach
Build a lightweight `RichTextEditor` component that provides:
- A toolbar with basic formatting buttons (Bold, Italic, Underline, Link, Lists, Headings)
- A visual editing area using `contentEditable` div
- A toggle to switch to raw HTML view (code editor mode using a monospace `<Textarea>`)
- The component stores content as HTML string internally

### Changes

**1. Create `src/components/admin/RichTextEditor.tsx`**
- A new component with a formatting toolbar (Bold, Italic, Underline, Strikethrough, Link, Ordered List, Unordered List, alignment)
- Uses `document.execCommand` for formatting in the contentEditable area
- Toggle button to switch between "Visual" and "HTML" modes
- Accepts `value` (HTML string) and `onChange` callback
- Styled consistently with existing admin UI (borders, rounded corners, muted backgrounds)

**2. Update `src/pages/admin/PageEditor.tsx`**
- Replace the `<Textarea>` for **paragraph** blocks (line 487) with the new `RichTextEditor`
- Replace the `<Input>` for **heading** text (line 483) with the `RichTextEditor`
- The **HTML block** (line 496-504) already accepts raw HTML, but will also get the `RichTextEditor` with HTML mode as default
- Keep the existing `<Textarea>` for the html block type as-is (it's already a code editor)

**3. Update `src/components/cms/CmsBlockRenderer.tsx`**
- Update the paragraph renderer (line 79-83) to use `dangerouslySetInnerHTML` instead of plain text, so rich text formatting (bold, italic, links) renders on the frontend

**4. Add `richtext` field type to `ComponentPropSchemas.ts`**
- Add `"richtext"` to the `PropFieldType` union so component schemas can also use it
- Update `PropFieldInput` in PageEditor to render `RichTextEditor` for `richtext` type fields

### No new dependencies needed
The rich text editor will use the browser's built-in `contentEditable` and `document.execCommand` APIs, avoiding any external library.

