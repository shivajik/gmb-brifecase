

## Plan: Global Theme Settings and Consistent CMS Page Styling

### Problem
Pages created via the CMS editor (e.g., `/about-our-company`) render with plain, unstyled heading/paragraph blocks, while hardcoded pages (e.g., `/about`) use rich React components like `AboutHero` with gradient backgrounds, centered layouts, and proper typography hierarchy. The Header and Footer are already shared via `Layout`, but the **content area styling** is inconsistent because `CmsBlockRenderer` applies minimal CSS to basic blocks.

### Root Cause
- `CmsBlockRenderer` renders headings as plain `<h2 class="text-3xl font-bold">` with no section background, no gradient, no visual hierarchy
- Hardcoded pages use components like `AboutHero` which include `bg-gradient-to-br from-secondary via-background to-accent`, centered containers, and proper spacing
- There's no concept of "section styling" or "global theme" that CMS blocks can inherit

### Approach
Two-part fix:

**Part 1: Global Theme Config** -- Create a theme settings system that stores site-wide styling defaults (hero section gradient, section backgrounds, typography scale, spacing). These are applied automatically by `CmsBlockRenderer` so every CMS page matches the site aesthetic.

**Part 2: Enhanced Block Rendering** -- Upgrade `CmsBlockRenderer` to apply proper visual styling to content blocks, particularly the first heading block (treat as hero), and add section wrapper options.

### Changes

**1. Create `src/config/themeSettings.ts`**
- Export a `THEME` object with:
  - `heroGradient`: CSS class for hero sections (e.g., `"bg-gradient-to-br from-secondary via-background to-accent"`)
  - `sectionBg`: alternating section backgrounds
  - `headingStyles`: per-level typography classes (h1 = `"text-4xl md:text-5xl font-bold"`, h2 = `"text-3xl font-bold"`, etc.)
  - `containerWidth`: default max-width class
  - `sectionPadding`: default py class
- This is the single source of truth for site-wide styling

**2. Update `CmsBlockRenderer.tsx`**
- First heading block in a page gets "hero treatment": wrapped in the theme's hero gradient section with centered text, matching `AboutHero` / `FeaturesHero` styling
- Subsequent heading blocks get proper section divider styling
- Apply theme heading typography classes based on level (h1/h2/h3/h4)
- Paragraphs following a hero heading get subtitle styling (larger text, muted, centered)
- Apply alternating section backgrounds to grouped inline blocks

**3. Update `CmsPage.tsx`**
- Pass page template to `CmsBlockRenderer` so it can adjust rendering (e.g., `landing` template gets full-width hero, `default` gets standard container)

**4. Update hardcoded components to use shared theme**
- Update `AboutHero`, `FeaturesHero`, and similar components to import from `themeSettings.ts` so the gradient/spacing classes come from one place
- This ensures if the theme is changed, both CMS and hardcoded pages update together

### Technical Details
- No new dependencies needed
- The theme config is a simple TypeScript object (not database-stored, to keep it fast and avoid extra queries)
- The hero detection logic: first `heading` block with level `h1` gets hero treatment automatically
- Existing component blocks (`type: "component"`) are unaffected -- they already render with their own styling

### Files to Create
- `src/config/themeSettings.ts`

### Files to Update
- `src/components/cms/CmsBlockRenderer.tsx` (hero treatment, theme-based styling)
- `src/pages/CmsPage.tsx` (pass template info)
- `src/components/about/AboutHero.tsx` (use shared theme classes)
- `src/components/features/FeaturesHero.tsx` (use shared theme classes)

