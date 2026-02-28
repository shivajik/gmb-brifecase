

## CMS with Custom Authentication - Implementation Plan

### Prerequisite: Connect External Supabase
You need to connect your Supabase project first. I'll prompt you to do this before any database work.

---

### Phase 1: Database Schema & Custom Auth System

**Database tables via Supabase migrations:**

- `cms_users` — id (uuid), email (unique), password_hash (text), name, created_at, updated_at
- `cms_sessions` — id (uuid), user_id (FK), token (unique), expires_at, created_at
- `cms_user_roles` — id, user_id (FK to cms_users), role (enum: admin/editor/viewer)
- `pages` — id, slug, title, content (jsonb), status (draft/published), template, meta_title, meta_description, meta_keywords, og_image, author_id, created_at, updated_at, published_at
- `menus` — id, name, location (header/footer/sidebar)
- `menu_items` — id, menu_id (FK), label, url, page_id (nullable FK), parent_id (self-ref), sort_order, target, css_class
- `site_settings` — id, key (unique), value (jsonb), group (appearance/general/seo/scripts)
- `widgets` — id, location, widget_type, title, content (jsonb), sort_order, active (boolean)
- `media` — id, filename, url, alt_text, mime_type, size, uploaded_by, created_at

**Edge functions for custom auth:**
- `cms-auth/login` — validates email/password (bcrypt), creates session token, returns JWT
- `cms-auth/register` — creates user with hashed password (admin-only action)
- `cms-auth/logout` — invalidates session
- `cms-auth/verify` — validates session token, returns user + role

**RLS:** All CMS tables use RLS policies that check session validity via a security definer function querying `cms_sessions` and `cms_user_roles`.

---

### Phase 2: Admin Dashboard Shell
- `/admin/login` — custom login page (email + password form)
- `/admin` — protected layout with sidebar navigation
- Auth context provider that stores JWT in memory (not localStorage for security), with httpOnly cookie option via edge function
- Route guard component checking auth state
- Sidebar: Dashboard, Pages, Menus, Widgets, Media, Appearance, Settings, Users

### Phase 3: Page Management
- Page list with search, status filter, bulk actions
- Page editor: title, slug (auto-gen), content blocks (JSON-based), status toggle
- Per-page SEO panel: meta title, description, keywords, OG image upload
- Draft/publish/schedule workflow
- Revision history (optional)

### Phase 4: Menu Manager
- CRUD menus assigned to locations
- Drag-and-drop menu item ordering
- Nested items support (parent/child)
- Link to pages or external URLs

### Phase 5: Widgets & Media
- Widget CRUD by location (header bar, footer columns, sidebar)
- Widget types: text/HTML, link list, social icons, contact info
- Media library with upload to Supabase Storage, browse, delete

### Phase 6: Appearance & Settings
- Appearance: colors, fonts, logo/favicon upload
- General settings: site title, tagline, default SEO
- Script injection: analytics, custom head/body scripts
- All stored in `site_settings` key-value table

### Phase 7: User Management
- List CMS users with roles
- Create/invite users (admin only)
- Assign/change roles
- Deactivate accounts

### Phase 8: Frontend Integration
- Dynamic page rendering from DB content
- Dynamic menu rendering
- Site settings applied globally (colors, logo, meta tags)
- Per-page SEO `<head>` tags

---

### Technical Details

- **Auth flow**: Edge function hashes passwords with bcrypt, issues JWT tokens stored in-memory on the client with refresh via httpOnly cookie. No Supabase Auth involved.
- **Content model**: Page content stored as JSON blocks for flexibility (headings, text, images, CTAs).
- **Admin UI**: Built with existing shadcn/ui components (tables, forms, dialogs, tabs).
- **Data fetching**: React Query for all admin CRUD operations.
- **Security**: All mutations go through edge functions that validate the session token. RLS as a secondary defense layer.

### Build Order
Phase 1 first (requires Supabase connection). Each phase is 3-6 iterations. We start by connecting Supabase.

