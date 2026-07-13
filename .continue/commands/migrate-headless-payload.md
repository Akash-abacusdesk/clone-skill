---
name: migrate-headless-payload
description: "Reverse-engineer any website and migrate it into a locked Next.js frontend paired with a code-first "
invokable: true
---
<!-- AUTO-GENERATED from .claude/skills/migrate-headless-payload/SKILL.md — do not edit directly.
     Run `node scripts/sync-skills.mjs` to regenerate. -->


# Migrate to Headless Payload

You are about to reverse-engineer **$ARGUMENTS**, classify its content architecture, and generate a **production-ready, twin-engine codebase**:

1. **Locked Next.js Frontend** — pixel-perfect presentation layer where the CMS user has ZERO ability to alter page layouts, grids, or styles. Deployable to Cloudflare Pages as static/ISR assets.
2. **Code-First Payload CMS Backend** — structured content bucket running as a standalone Node process (port 3001) with PostgreSQL storage, strict RBAC, and automatic ISR revalidation webhooks.

This is a **single-URL command**. If multiple URLs are provided, reject with: "This command processes one URL at a time. Run it separately for each site."

---

## Pre-Flight

### Step 0: Mandatory Environment Configuration Prompt

**STOP HERE BEFORE ANY OTHER WORK.** You must ask the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Configure File Handling Environment for this migration test run:

  [local]  — Store uploads on local disk (cms/media/)
  [r2]     — Store uploads in Cloudflare R2 bucket

Enter choice (local / r2):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Store the user's response as `FILE_HANDLING_MODE`. This variable controls:
- Whether `@payloadcms/plugin-cloud-storage` with the R2 adapter is included in the generated `payload.config.ts`
- Whether `.env.example` includes R2 credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`)
- Whether the generated upload collections use cloud storage adapter hooks or local disk paths

**Do NOT proceed until the user responds.** This is a hard gate.

### Step 1: Validate Input

1. Parse `$ARGUMENTS` as exactly ONE URL. If multiple are provided, reject immediately.
2. Normalize and validate the URL. If invalid, ask the user to correct it.
3. **Browser automation is required.** Check for available browser MCP tools (Chrome MCP, Playwright MCP, Browserbase MCP, Puppeteer MCP, etc.). Use whichever is available — prefer Chrome MCP. If none are detected, ask the user which browser tool they have. This skill cannot work without browser automation.
4. Verify the URL is accessible via your browser MCP tool.

### Step 2: Verify Base Project

1. Run `npm run build` to verify the Next.js + shadcn/ui + Tailwind v4 scaffold compiles.
2. Create output directories if they don't exist:
   - `docs/research/`, `docs/research/components/`, `docs/design-references/`, `scripts/`
   - `cms/`, `cms/collections/`, `cms/globals/`, `cms/access/`, `cms/seed/`

### Step 3: Load Templates

Read the reference templates from `.claude/skills/migrate-headless-payload/templates/`:
- `cms/payload.config.ts.template`
- `cms/collections/Pages.ts.template`
- `cms/collections/DynamicCollection.ts.template`
- `cms/globals/SiteConfig.ts.template`
- `cms/access/rbac.ts.template`
- `cms/seed/webhook-config.ts.template`
- `frontend/lib/payload.ts.template`
- `frontend/api/revalidate/route.ts.template`

These are your scaffolding references. You will customize them with site-specific field definitions discovered during Phase 1.

---

## Guiding Principles

All principles from the `/clone-website` skill apply here, plus these additional constraints:

### 1. Layout Code Is Immutable

The CMS user must NEVER be able to change page structure, component order, grid layouts, or styling through the CMS admin panel. The CMS is a **structured data bucket** — not a page builder. No dynamic zones, no flexible content blocks, no layout builder fields. Every page layout is hardcoded in Next.js.

### 2. Content Is Typed and Constrained

Every CMS field must have an explicit type, validation rules, and a purpose. No generic "content" rich-text blobs that could hold arbitrary HTML. Fields are surgical: `heroTitle` (text, maxLength: 120), `heroSubtitle` (text, maxLength: 200), `visionStatement` (textarea, maxLength: 500). The agent defines the exact schema — the client fills in the blanks.

### 3. Single Types Lock Structure, Collection Types Lock Templates

- **Single Type** (Home, About, Contact): One document per type. The client can edit field values but cannot create new pages, delete the page, or rearrange sections.
- **Collection Type** (Products, Services, Portfolio): The client can add/delete items, but every item renders through the same locked `[slug]/page.tsx` template. The template structure is immutable.

### 4. Globals Are Configuration, Not Content

Global fields (logo, phone, email, social links) are site-wide configuration. They appear in the header/footer/contact sections. The client can update values but the placement and styling is coded.

### 5. RBAC Is Non-Negotiable

Every collection and global must import the RBAC access module. The `client` role:
- **CAN**: read all, update all, create/delete Collection Types
- **CANNOT**: create or delete Single Type documents (Pages)
- **CANNOT**: access Payload admin settings, user management, or webhook configuration

### 6. The Frontend Fetches, Never Assumes

No hardcoded content in Next.js page files. Every text, image, link, and data point comes from a `fetch()` call to the Payload REST API. The frontend is a pure rendering engine driven by API data.

---

## Phase 1: Expanded Structural Analysis & Schema Definition

This phase extends the standard clone-website reconnaissance with a **data architecture classification pass**.

### 1.1 Standard Reconnaissance

Perform the full reconnaissance pipeline from the clone-website skill:

**Screenshots** — Take full-page screenshots at desktop (1440px) and mobile (390px). Save to `docs/design-references/`.

**Global Extraction** — Fonts, colors, favicons, meta, global UI patterns. Same process as clone-website.

**Mandatory Interaction Sweep** — Scroll sweep, click sweep, hover sweep, responsive sweep. Save findings to `docs/research/BEHAVIORS.md`.

**Page Topology** — Map every section top to bottom. Save as `docs/research/PAGE_TOPOLOGY.md`.

### 1.2 Data Architecture Classification

After the standard reconnaissance, perform a dedicated data classification pass. For each page and section discovered in the topology:

**Navigation Analysis:**
- Extract all navigation links and their href targets
- Classify each linked page as either a Single Type (unique page like /about) or a Collection Type index (listing page like /products) or a Collection Type detail (item page like /products/widget-x)
- Document the URL pattern: static path = Single Type, dynamic `[slug]` pattern = Collection Type

**Content Field Mapping:**
For each page/section, map every piece of visible content to a typed CMS field:

```javascript
// Run via browser MCP on each page section
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'not found' });
  const fields = [];
  // Text nodes
  el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,blockquote,figcaption').forEach(node => {
    const text = node.textContent?.trim();
    if (text && text.length > 0) {
      fields.push({
        tag: node.tagName.toLowerCase(),
        text: text.slice(0, 300),
        charCount: text.length,
        suggestedType: node.tagName.match(/^H[1-6]$/) ? 'text' :
                       text.length > 500 ? 'richText' : 'textarea',
        suggestedMaxLength: Math.ceil(text.length * 1.5)
      });
    }
  });
  // Images
  el.querySelectorAll('img').forEach(img => {
    fields.push({
      tag: 'img',
      src: img.src,
      alt: img.alt,
      suggestedType: 'upload',
      dimensions: { w: img.naturalWidth, h: img.naturalHeight }
    });
  });
  // Links
  el.querySelectorAll('a[href]').forEach(a => {
    fields.push({
      tag: 'a',
      href: a.href,
      text: a.textContent?.trim().slice(0, 100),
      suggestedType: 'group',
      suggestedFields: ['label:text', 'url:text', 'openInNewTab:checkbox']
    });
  });
  return JSON.stringify(fields, null, 2);
})('SELECTOR');
```

**Repeating Pattern Detection:**
- Look for lists of similar items (product cards, service tiles, team members, portfolio projects)
- If 3+ items share the same DOM structure with different content, classify as a Collection Type
- Extract the shared field schema from the repeating pattern

**Global Configuration Detection:**
- Check header and footer for: logo image, company name, phone numbers, email addresses, physical address
- Check for social media link arrays (icons linking to external platforms)
- Check for copyright text, taglines, or slogans that appear site-wide

### 1.3 Output: Data Migration Map

Write the classification results to `docs/research/data-migration-map.json`:

```json
{
  "sourceUrl": "https://example.com",
  "fileHandlingMode": "local | r2",
  "singleTypes": [
    {
      "name": "Home",
      "slug": "home",
      "sourceUrl": "/",
      "fields": [
        { "name": "heroTitle", "type": "text", "maxLength": 120, "required": true, "extractedValue": "Welcome to Example" },
        { "name": "heroSubtitle", "type": "textarea", "maxLength": 300, "required": false, "extractedValue": "..." },
        { "name": "heroImage", "type": "upload", "required": true, "extractedSrc": "/images/hero.jpg" },
        { "name": "featuresHeading", "type": "text", "maxLength": 80, "required": true, "extractedValue": "Our Features" },
        { "name": "features", "type": "array", "fields": [
          { "name": "icon", "type": "upload" },
          { "name": "title", "type": "text", "maxLength": 60 },
          { "name": "description", "type": "textarea", "maxLength": 200 }
        ], "extractedCount": 4 }
      ]
    }
  ],
  "collectionTypes": [
    {
      "name": "Products",
      "slug": "products",
      "sourceIndexUrl": "/products",
      "sourceDetailPattern": "/products/:slug",
      "itemFields": [
        { "name": "title", "type": "text", "maxLength": 120, "required": true },
        { "name": "slug", "type": "text", "unique": true, "admin": { "readOnly": true } },
        { "name": "description", "type": "richText", "required": true },
        { "name": "featuredImage", "type": "upload", "required": true },
        { "name": "price", "type": "number", "required": false },
        { "name": "status", "type": "select", "options": ["draft", "published"], "defaultValue": "draft" }
      ],
      "extractedItems": 12
    }
  ],
  "globals": [
    {
      "name": "SiteConfig",
      "fields": [
        { "name": "logo", "type": "upload", "required": true },
        { "name": "companyName", "type": "text", "maxLength": 100 },
        { "name": "email", "type": "email" },
        { "name": "phone", "type": "text", "maxLength": 30 },
        { "name": "address", "type": "textarea", "maxLength": 300 },
        { "name": "socialLinks", "type": "array", "fields": [
          { "name": "platform", "type": "select", "options": ["facebook", "twitter", "instagram", "linkedin", "youtube", "tiktok", "github"] },
          { "name": "url", "type": "text" }
        ]}
      ]
    }
  ]
}
```

Also write `docs/research/payload-field-map.json` — a flat lookup table mapping each DOM selector to its corresponding Payload field path (e.g., `".hero h1" → "pages.home.heroTitle"`).

### 1.4 Component Specification

For each page section, write component spec files to `docs/research/components/` using the same template format as the clone-website skill. These specs drive the Track A builder agents.

---

## Phase 2: Dual-Track Blueprint & Code Generation

After Phase 1 completes, you have: page topology, behaviors, component specs, data migration map, and field mappings. Now you build two codebases in parallel using Git worktree branches.

### Track A: Standalone Next.js Frontend

**Each builder agent in Track A** receives:
- The component spec file (inline, as in clone-website)
- The relevant section from `data-migration-map.json` showing which fields to fetch
- The `src/lib/payload.ts` client module API (already generated — see below)
- Instructions to replace ALL hardcoded text/images with API data

#### A.1: Generate Shared Payload Client

Before dispatching any builder, create `src/lib/payload.ts`:

```typescript
// Use the frontend/lib/payload.ts.template as reference
// This provides: fetchSingleType<T>(), fetchCollectionItem<T>(), fetchCollectionList<T>(), fetchGlobal<T>()
// All functions use process.env.PAYLOAD_PUBLIC_SERVER_URL
// All fetch calls MUST inject target data tags: next: { tags: [slug] }
// All fetch calls MUST use a fallback time-based configuration: next: { revalidate: 3600 }
```

#### A.2: Generate TypeScript Interfaces

Create `src/types/payload.ts` with interfaces matching every Single Type, Collection Type, and Global defined in `data-migration-map.json`. These are used by both the frontend fetch functions and the page components.

#### A.3: Generate Page Routes

For each Single Type, generate a static page route:
- `src/app/page.tsx` (Home)
- `src/app/about/page.tsx` (About)
- `src/app/contact/page.tsx` (Contact)

Each page file:
1. Imports the component sections (same as clone-website assembly)
2. Calls `fetchSingleType<HomePage>('home')` at the top level (server component)
3. Passes typed data as props to each section component
4. Components render the data — NO hardcoded strings

For each Collection Type, generate:
- `src/app/products/page.tsx` — calls `fetchCollectionList<Product>('products')`, renders a grid
- `src/app/products/[slug]/page.tsx` — calls `fetchCollectionItem<Product>('products', params.slug)`, renders detail view
- You MUST programmatically generate a complete `generateStaticParams()` function that fetches all target collection rows from the CMS at build time to pre-render every path.
- You MUST ensure all dynamic templates include `export const dynamicParams = true;` to handle mid-tier runtime additions cleanly.

#### A.4: Generate Layout with Global Data

Update `src/app/layout.tsx` to:
1. Fetch `fetchGlobal<SiteConfig>('site-config')` 
2. Pass global data (logo, nav, social links) to header/footer components
3. Keep the existing font and CSS configuration

#### A.5: Dispatch Component Builders

Use the same worktree-based parallel dispatch as clone-website. Each builder gets:
- Component spec (inline)
- The typed props interface
- The data fields it should render
- The section screenshot
- Instruction to use `cn()`, shadcn primitives, Tailwind classes
- Instruction to verify `npx tsc --noEmit`

**Critical constraint for builders:** Components must accept typed props and render them. No `fetch()` inside components — data fetching happens at the page level (server components). Components are pure presentation.

### Track B: Code-First Payload CMS Generation

**This track generates the complete `cms/` directory.** It can run in parallel with Track A since the two codebases only share the TypeScript interfaces and the REST API contract.

#### B.1: Generate RBAC Access Module

Write `cms/access/rbac.ts` using the template, customized for the discovered roles:

```typescript
// Exports:
// - isAdmin(req) — returns true if user.role === 'admin'
// - isAdminOrEditor(req) — returns true if role is 'admin' or 'editor'
// - clientCannotCreateOrDelete — access config object:
//     { create: isAdmin, delete: isAdmin, update: () => true, read: () => true }
// - fullCRUD — access config object:
//     { create: () => true, delete: () => true, update: () => true, read: () => true }
```

#### B.2: Generate Single Type Collections

For each Single Type in `data-migration-map.json`, generate a collection file in `cms/collections/`:

```typescript
// Example: cms/collections/Pages.ts
// - Uses the Pages.ts.template as base
// - Populates the fields array from data-migration-map.json
// - CRITICAL RBAC CONSTRAINT: You MUST import clientCannotCreateOrDelete from '../access/rbac'
// - MUST set `access: clientCannotCreateOrDelete`
// - This explicit restriction ensures `create` and `delete` hooks return false for the `client` role (e.g., `user?.role === 'admin'`).
// - By blocking these hooks, the Payload admin dashboard will automatically suppress and hide the "Create New" and "Delete" buttons for clients.
// - Sets admin: { useAsTitle: 'title' }
// - NO dynamic zones, NO blocks, NO flexible content
```

#### B.3: Generate Collection Type Collections

For each Collection Type, generate a collection file:

```typescript
// Example: cms/collections/Products.ts
// - Uses the DynamicCollection.ts.template as base
// - Populates fields from data-migration-map.json
// - Imports fullCRUD from '../access/rbac'
// - Sets access: fullCRUD (clients CAN create/delete items)
// - Includes slug field with auto-generation from title
// - Includes status field (draft/published) with default 'draft'
```

#### B.4: Generate Globals

Write `cms/globals/SiteConfig.ts` using the template, populated with the discovered global fields.

#### B.5: Generate Payload Config

Write `cms/payload.config.ts` using the template:
- Uses `@payloadcms/db-postgres` adapter with `process.env.DATABASE_URI`
- If `FILE_HANDLING_MODE === 'r2'`: includes `@payloadcms/plugin-cloud-storage` with R2 adapter
- If `FILE_HANDLING_MODE === 'local'`: uses default local upload with `staticDir: './media'`
- Imports all generated collections and globals
- Sets `serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL`
- Configures admin user collection with role field

#### B.6: Generate Webhook Seed

Write `cms/seed/webhook-config.ts` — a script that registers an `afterChange` hook on all collections to POST to `${process.env.FRONTEND_URL}/api/revalidate` with the `REVALIDATION_SECRET` bearer token.

#### B.7: Generate CMS Package Files

Write `cms/package.json` and `cms/tsconfig.json` with all Payload 3.x dependencies.

### Track Merge

After both tracks complete:
1. Merge all worktree branches into main
2. Resolve any conflicts (primarily in `src/types/` which both tracks may touch)
3. Run `npm run build` on the frontend — must pass clean
4. Run `npx tsc --noEmit` in `cms/` — must pass clean

---

## Phase 3: Automatic Webhook Integration

After the dual-track merge, wire the revalidation pipeline:

### 3.1: Generate Revalidation API Route

Write a secure Next.js Route Handler at `src/app/api/revalidate/route.ts` (not `page.tsx`) using the template:

```typescript
// POST handler that:
// 1. Reads Authorization header, extracts Bearer token
// 2. Compares token against process.env.REVALIDATION_SECRET
// 3. If invalid: returns 401
// 4. Reads { collection, slug, operation } from request JSON body
// 5. Determines the path/tag to revalidate based on collection + slug
// 6. Executes revalidatePath(path) and revalidateTag(tag) within an insulated try/catch block!
// 7. Returns 200 with { revalidated: true, path }
```

### 3.2: Wire Payload Hooks

The webhook seed from B.6 already configures the `afterChange` hook. Verify it:
- Fires on document publish/update for all collections and globals
- Sends POST to `${FRONTEND_URL}/api/revalidate` with bearer token
- Includes `{ collection, slug, operation }` in the request body
- Has error handling (log failures, don't crash CMS)

### 3.3: Generate Environment Files

Write `.env.example` with all required variables:

```env
# Frontend
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
REVALIDATION_SECRET=change-me-to-a-secure-random-string

# Payload CMS
PAYLOAD_SECRET=change-me-to-a-long-random-string
DATABASE_URI=postgresql://payload:payload@localhost:5432/payload
FRONTEND_URL=http://localhost:3000

# Cloudflare R2 (only if FILE_HANDLING_MODE=r2)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### 3.4: Update Docker Compose

Add services for the CMS and PostgreSQL to `docker-compose.yml`:

```yaml
cms:
  build: ./cms
  ports: ["3001:3001"]
  environment:
    - DATABASE_URI=postgresql://payload:payload@postgres:5432/payload
    - PAYLOAD_SECRET=${PAYLOAD_SECRET}
    - FRONTEND_URL=http://app:3000
  depends_on: [postgres]

postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: payload
    POSTGRES_PASSWORD: payload
    POSTGRES_DB: payload
  volumes:
    - pgdata:/var/lib/postgresql/data
  ports: ["5432:5432"]
```

### 3.5: Update Next.js Config

Add remote image patterns to `next.config.ts` to allow images from the Payload CMS server and optionally from R2:

```typescript
images: {
  remotePatterns: [
    { protocol: 'http', hostname: 'localhost', port: '3001' },
    { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
  ]
}
```

---

## Phase 4: Verification & QA

### 4.1: Build Verification

```bash
# Frontend must compile
npm run build

# CMS TypeScript must pass
cd cms && npx tsc --noEmit

# Docker compose must be valid
docker compose config --quiet
```

### 4.2: Visual QA

Same as clone-website Phase 5 — take side-by-side screenshots at desktop and mobile, compare section by section, fix discrepancies.

### 4.3: API Contract Verification

For each page route, verify:
- The `fetch()` URL matches the Payload REST API pattern: `${PAYLOAD_PUBLIC_SERVER_URL}/api/<collection>?where[slug][equals]=<slug>`
- The TypeScript interfaces match the collection field definitions
- The `revalidate` tags match between the page routes and the webhook handler

### 4.4: RBAC Verification

Review every generated collection file and verify:
- Single Types have `access: clientCannotCreateOrDelete`
- Collection Types have `access: fullCRUD`
- Globals have `access: { read: () => true, update: isAdminOrEditor }`

---

## Pre-Dispatch Checklist (Extended)

Before dispatching ANY builder agent, verify ALL of these:

**From clone-website (still applies):**
- [ ] Spec file written with ALL sections filled
- [ ] Every CSS value from `getComputedStyle()`, not estimated
- [ ] Interaction model identified and documented
- [ ] All images identified (including overlays)
- [ ] Text content verbatim from the site
- [ ] Builder prompt under ~150 lines

**New for migrate-headless-payload:**
- [ ] `data-migration-map.json` written and validated
- [ ] Every text/image field has a named Payload field mapping
- [ ] Single Types have explicit field lists with types and maxLength
- [ ] Collection Types have itemFields with slug auto-generation
- [ ] Globals have all site-wide configuration fields
- [ ] `FILE_HANDLING_MODE` has been confirmed by user (local / r2)
- [ ] RBAC access rules assigned to every collection
- [ ] Frontend fetch functions typed with correct interfaces

---

## What NOT to Do (Extended)

Everything from clone-website, plus:

- **Don't use Payload's layout builder or flexible content blocks.** This defeats the locked-layout architecture. Every field is explicit and typed.
- **Don't allow dynamic zones in Single Types.** The client cannot add/remove sections. Period.
- **Don't hardcode content in Next.js pages.** Every string comes from the API. If a builder outputs `<h1>Welcome</h1>` instead of `<h1>{data.heroTitle}</h1>`, it has failed.
- **Don't skip RBAC on any collection.** Every collection and global must import and use the access module.
- **Don't use Payload's built-in Next.js integration.** The CMS runs as a standalone Node process on port 3001. The frontend is a separate Next.js app on port 3000. They communicate via REST API only.
- **Don't generate CMS schema without the data migration map.** The map drives the schema. No map = no schema.
- **Don't mix storage adapters.** If the user chose `local`, everything is local. If `r2`, everything goes to R2. No hybrid.
- **Don't forget `generateStaticParams()` for Collection Types.** Without it, dynamic routes won't pre-render at build time.
- **Don't skip the webhook seed.** Without it, content updates in Payload won't trigger frontend revalidation.

---

## Completion

When done, report:

- Total pages generated (Single Types + Collection Type templates)
- Total CMS collections generated
- Total CMS fields defined across all collections
- Total globals configured
- RBAC verification status (all collections covered: yes/no)
- File handling mode used (local / r2)
- Frontend build status (`npm run build` result)
- CMS typecheck status (`npx tsc --noEmit` result)
- Revalidation endpoint generated (yes/no)
- Webhook seed generated (yes/no)
- Docker compose services configured (frontend + cms + postgres)
- Visual QA results
- Any known gaps or limitations
