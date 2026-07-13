<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer & Headless Migration Template

## What This Is
A reusable template for reverse-engineering any website using AI coding agents. Two skills are available:
- `/clone-website <url>` — Pixel-perfect static frontend clone (Next.js + shadcn/ui + Tailwind v4).
- `/migrate-headless-payload <url>` — Full headless CMS migration producing a **locked Next.js frontend** + **code-first Payload CMS backend** with RBAC, ISR webhooks, and split-control architecture.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **CMS:** Payload CMS 3.x (standalone on port 3001, code-first config, Lexical editor)
- **Database:** PostgreSQL 16 via `@payloadcms/db-postgres`
- **Storage:** Local disk or Cloudflare R2 via `@payloadcms/plugin-cloud-storage` (configurable)
- **Deployment:** Frontend → Cloudflare Pages / Vercel | CMS → Docker / Node.js host

## Commands
- `npm run dev` — Start frontend dev server
- `npm run build` — Frontend production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build
- `/clone-website <url>` — Clone a website as a static frontend
- `/migrate-headless-payload <url>` — Migrate a website to headless CMS architecture

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters
- **Locked layouts** (migrate-headless-payload) — CMS users edit content fields only, never page structure
- **Split-control architecture** — frontend code is immutable; CMS is a structured data bucket

## Project Structure
```
src/
  app/              # Next.js routes
    api/
      revalidate/   # ISR webhook endpoint (migrate-headless-payload)
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
    payload.ts      # Payload API client (migrate-headless-payload)
  types/            # TypeScript interfaces
    payload.ts      # CMS data types (migrate-headless-payload)
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
cms/                # Payload CMS backend (migrate-headless-payload)
  collections/      # Collection schemas (Pages, Products, etc.)
  globals/          # Global configs (SiteConfig)
  access/           # RBAC access control module
  seed/             # Webhook config and seed scripts
  payload.config.ts # Payload configuration entry point
  package.json      # CMS dependencies
docs/
  research/         # Inspection output (design tokens, components, layout)
    data-migration-map.json   # Content architecture classification
    payload-field-map.json    # DOM-to-CMS field mapping
  design-references/ # Screenshots and visual references
scripts/            # Asset download & sync scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing any skill in `.claude/skills/*/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate commands for all platforms (dynamically discovers all skills).

@docs/research/INSPECTION_GUIDE.md
