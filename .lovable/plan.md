

## Plan: WordPress Classic Editor + WPBakery-Style Page Builder

### Problem
The current page editor uses stacked card-based blocks with small up/down arrows for reordering. It feels technical and unfamiliar to non-developers. The user wants something closer to **WordPress Classic Editor** (unified rich text area with media insertion) and **WPBakery** (visual drag-and-drop rows/columns with element insertion).

### Approach
Transform the editor into a hybrid that combines:
1. **A WordPress Classic-style toolbar** -- sticky top toolbar with formatting, media insertion, and "Add Element" button
2. **WPBakery-style visual block management** -- inline block controls (hover-to-reveal edit/move/delete), drag-and-drop reordering, and a visual element picker modal
3. **Live preview within the editor** -- component blocks render their actual output inline instead of showing raw prop fields

### Changes

**1. Redesign `PageEditor.tsx` layout**
- Move page settings (title, slug, template, status) into a collapsible sidebar panel on the right (like WordPress "Publish" and "Page Attributes" metaboxes)
- The main content area takes up the full width with blocks rendered inline
- Sticky save/publish bar at the top

**2. Create `src/components/admin/BlockToolbar.tsx` -- Sticky formatting toolbar**
- A WordPress-style sticky toolbar above the content area
- "Add Element" button opens a categorized element picker modal (like WPBakery's element grid)
- Formatting buttons apply to the currently focused rich text block

**3. Create `src/components/admin/ElementPickerModal.tsx` -- WPBakery-style element grid**
- Full-screen or large modal with a searchable grid of available elements
- Categories: "Content" (heading, paragraph, image, spacer, HTML), "Components" (all registered components)
- Each element shows an icon, label, and brief description
- Click to insert at the current position (or at the end)

**4. Redesign `BlockEditor` component -- Inline visual blocks**
- Blocks render with a subtle dashed border on hover (like WPBakery)
- Hover reveals a floating toolbar at top-right: drag handle, edit (pencil icon), duplicate, delete
- Clicking "edit" opens the block's settings in a slide-over panel from the right (not inline accordion)
- Component blocks show a small live preview or placeholder with the component name and icon
- Drag-and-drop reordering using HTML5 drag events (no new library needed)

**5. Create `src/components/admin/BlockSettingsPanel.tsx` -- Slide-over editor panel**
- When editing a block, a right-side panel slides in (like WPBakery's element settings)
- Contains all the existing prop fields (heading level selector, image URL, component props, etc.)
- "Save" and "Cancel" buttons at the bottom
- Rich text blocks can still be edited inline in the content area

**6. Enhance `RichTextEditor.tsx`**
- Add heading format dropdown (Paragraph, H1-H4) to the toolbar -- like WordPress
- Add "Insert Media" button placeholder in toolbar
- Add font color picker button
- Add blockquote and horizontal rule buttons
- Add fullscreen editing toggle

**7. Update `PageEditor.tsx` -- WordPress-style publish metabox**
- Right sidebar with:
  - **Publish** box: Status dropdown, Save Draft / Publish button, "Preview" link
  - **Page Attributes** box: Template selector, slug editor
  - **SEO** box: Collapsible meta fields
- Use `ResizablePanelGroup` for the main content + sidebar layout

### Technical Details
- Drag-and-drop uses native HTML5 `dragstart`/`dragover`/`drop` events on block wrappers (no new dependencies)
- The element picker modal uses the existing `Dialog` component with a grid layout
- The settings panel uses the existing `Sheet` component (slide-over from right)
- The right sidebar uses `ResizablePanelGroup` already installed in the project
- All existing block data structures and save logic remain unchanged -- this is purely a UI/UX redesign

### Files to Create
- `src/components/admin/ElementPickerModal.tsx`
- `src/components/admin/BlockSettingsPanel.tsx`
- `src/components/admin/BlockToolbar.tsx`

### Files to Update
- `src/pages/admin/PageEditor.tsx` (major rewrite -- WordPress-style layout)
- `src/components/admin/RichTextEditor.tsx` (add heading dropdown, media button, more tools)

