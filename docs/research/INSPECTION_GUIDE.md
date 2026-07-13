# Website Inspection Guide

## How to Reverse-Engineer Any Website

This guide outlines what to capture when inspecting a target website via Chrome MCP or browser DevTools.

## Phase 1: Visual Audit

### Screenshots to Capture
- [ ] Every distinct page — desktop, tablet, mobile
- [ ] Dark mode variants (if applicable)
- [ ] Light mode variants (if applicable)
- [ ] Key interaction states (hover, active, open menus, modals)
- [ ] Loading/skeleton states
- [ ] Empty states
- [ ] Error states

### Design Tokens to Extract
- [ ] **Colors** — background, text (primary/secondary/muted), accent, border, hover, error, success, warning
- [ ] **Typography** — font family, sizes (h1-h6, body, caption, label), weights, line heights, letter spacing
- [ ] **Spacing** — padding/margin patterns (look for a scale: 4px, 8px, 12px, 16px, 24px, 32px, etc.)
- [ ] **Border radius** — buttons, cards, avatars, inputs
- [ ] **Shadows/elevation** — card shadows, dropdown shadows, modal overlay
- [ ] **Breakpoints** — when does the layout shift? (inspect with DevTools responsive mode)
- [ ] **Icons** — which icon library? custom SVGs? sizes?
- [ ] **Avatars** — sizes, shapes, fallback behavior
- [ ] **Buttons** — all variants (primary, secondary, ghost, icon-only, danger)
- [ ] **Inputs** — text fields, textareas, selects, checkboxes, toggles

## Phase 2: Component Inventory

For each distinct UI component, document:
1. **Name** — what would you call this component?
2. **Structure** — what HTML elements / child components does it contain?
3. **Variants** — does it have different sizes, colors, or states?
4. **States** — default, hover, active, disabled, loading, error, empty
5. **Responsive behavior** — how does it change at different breakpoints?
6. **Interactions** — click, hover, focus, keyboard navigation
7. **Animations** — transitions, entrance/exit animations, micro-interactions

### Common Components to Look For
- Navigation (top bar, sidebar, bottom bar)
- Cards / list items
- Buttons and links
- Forms and inputs
- Modals and dialogs
- Dropdowns and menus
- Tabs and segmented controls
- Avatars and user badges
- Loading skeletons
- Toast notifications
- Tooltips and popovers

## Phase 3: Layout Architecture

- [ ] **Grid system** — CSS Grid? Flexbox? Fixed widths?
- [ ] **Column layout** — how many columns at each breakpoint?
- [ ] **Max-width** — main content area max-width
- [ ] **Sticky elements** — header, sidebar, floating buttons
- [ ] **Z-index layers** — navigation, modals, tooltips, overlays
- [ ] **Scroll behavior** — infinite scroll, pagination, virtual scrolling

## Phase 4: Technical Stack Analysis

- [ ] **Framework** — React? Vue? Angular? Check `__NEXT_DATA__`, `__NUXT__`, `ng-version`
- [ ] **CSS approach** — Tailwind (utility classes), CSS Modules, Styled Components, Emotion, vanilla CSS
- [ ] **State management** — Redux (check DevTools), React Query, Zustand, Pinia
- [ ] **API patterns** — REST, GraphQL (check network tab for `/graphql` requests)
- [ ] **Font loading** — Google Fonts, self-hosted, system fonts
- [ ] **Image strategy** — CDN, lazy loading, srcset, WebP/AVIF
- [ ] **Animation library** — Framer Motion, GSAP, CSS transitions only

## Phase 5: Data Architecture Analysis (migrate-headless-payload only)

This phase classifies every page and content element into the split-control architecture buckets. It is ONLY performed when running `/migrate-headless-payload`.

### Single Type vs Collection Type Classification
- [ ] **Navigation audit** — Extract all nav links and classify each target page:
  - Static path (e.g., `/about`, `/contact`) → **Single Type** — one document, locked layout
  - Index listing (e.g., `/products`, `/services`) → **Collection Type** index page
  - Detail page with slug pattern (e.g., `/products/blue-widget`) → **Collection Type** item template
- [ ] **Repeating pattern detection** — Scan for 3+ items sharing identical DOM structure with different content (product cards, team members, portfolio items). These indicate Collection Types.
- [ ] **Form detection** — Identify contact forms, newsletter signups. These need dedicated handling (not CMS-managed).

### Content Field Mapping
- [ ] **Text fields** — Map each heading, paragraph, label, and span to a named CMS field:
  - Short text (< 120 chars) → `text` type with `maxLength`
  - Medium text (120-500 chars) → `textarea` type with `maxLength`
  - Long structured text (> 500 chars) → `richText` type (Lexical editor)
- [ ] **Image fields** — Map each `<img>` and CSS background-image to an `upload` field (relationTo: 'media')
- [ ] **Link fields** — Map each `<a>` to a `group` field with `{ label: text, url: text, openInNewTab: checkbox }`
- [ ] **Array fields** — Map repeating sub-elements (feature cards, testimonials, team members) to `array` type fields with typed sub-fields
- [ ] **Select fields** — Map any dropdown, tab set, or category system to `select` type fields with defined options

### Global Configuration Detection
- [ ] **Header** — Logo (upload), company name (text), navigation items (array)
- [ ] **Footer** — Copyright text, secondary nav, social links (array of { platform: select, url: text })
- [ ] **Contact info** — Email (email), phone (text), address (textarea)
- [ ] **Social links** — Platform icons linking to external profiles

### Field Naming Convention
When naming CMS fields, use these rules:
- camelCase (e.g., `heroTitle`, not `hero_title` or `HeroTitle`)
- Descriptive and specific (e.g., `missionStatement`, not `text1`)
- Include the section name as prefix for page-specific fields (e.g., `aboutHeroTitle`, `contactFormHeading`)
- Use generic names for Collection Type fields (e.g., `title`, `description`, `featuredImage`)

## Phase 6: Migration Documentation Output

After inspection (when using `/migrate-headless-payload`), create these additional files in `docs/research/`:

6. `data-migration-map.json` — Structured content classification:
   ```json
   {
     "sourceUrl": "https://example.com",
     "fileHandlingMode": "local | r2",
     "singleTypes": [ { "name": "...", "slug": "...", "fields": [...] } ],
     "collectionTypes": [ { "name": "...", "slug": "...", "itemFields": [...] } ],
     "globals": [ { "name": "SiteConfig", "fields": [...] } ]
   }
   ```
7. `payload-field-map.json` — DOM selector → Payload field path lookup:
   ```json
   {
     ".hero h1": "pages.home.heroTitle",
     ".hero p": "pages.home.heroSubtitle",
     ".product-card .title": "products.title"
   }
   ```

## Phase 5 (original): Documentation Output

After inspection, create these files in `docs/research/`:
1. `DESIGN_TOKENS.md` — All extracted colors, typography, spacing
2. `COMPONENT_INVENTORY.md` — Every component with structure notes
3. `LAYOUT_ARCHITECTURE.md` — Page layouts, grid system, responsive behavior
4. `INTERACTION_PATTERNS.md` — Animations, transitions, hover states
5. `TECH_STACK_ANALYSIS.md` — What the site uses and our chosen equivalents
