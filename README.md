# Website Reverse-Engineer & Headless Migration Template

<a href="https://github.com/Akash-abacusdesk/clone-skill/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a> <a href="https://github.com/Akash-abacusdesk/clone-skill/stargazers"><img src="https://img.shields.io/github/stars/Akash-abacusdesk/clone-skill?style=flat" alt="Stars" /></a>

This repository is an **automated headless migration engine**. It leverages AI coding agents to reverse-engineer any website and migrate it into a production-ready, twin-engine codebase built on **Next.js 16** (standalone output), **Tailwind CSS v4**, and **Payload CMS 3.x** backed by a **PostgreSQL** database layer.

## Core Architecture Philosophy: Split-Control

The migration process is governed by a strict **split-control architecture**:
- **Frontend Engine**: The AI Agent codes pixel-perfect frontend layouts in Next.js. The CMS client has **0% UI layout control**. The presentation layer is fully locked, fetching data securely via the Payload REST API.
- **Backend Data Container**: Payload CMS acts purely as a structured data container. It enforces strict Role-Based Access Control (RBAC) boundaries, explicitly blocking clients from creating or deleting single page layouts, ensuring the structure remains untouched while empowering them to manage dynamic collections and data points.
- **Rigid ISR**: The frontend is fully optimized for Incremental Static Regeneration (ISR). The migration engine pre-renders all dynamic routes at build time via programmatic `generateStaticParams()` and invalidates cache on-demand via secure webhook integration on every CMS update.

---

## Step-by-Step Usage Instructions

> **Important:** Do not clone this template repository directly. Use GitHub's **Use this template** button to create your own copy first.

After downloading and opening your new repository locally, run `npm install` to prepare your workspace.

### Step 1: Synchronize Skills
Before invoking your AI agent, ensure the migration commands are synchronized across all supported platforms by running the multi-skill sync engine:

```bash
node scripts/sync-skills.mjs
```
*This compiles both the `/clone-website` and `/migrate-headless-payload` skills into native formats for 9 different AI development platforms (Claude Code, Cursor, Windsurf, GitHub Copilot, Gemini, etc.).*

### Step 2: Execution Command
Launch your preferred AI agent (e.g., `claude --chrome`) and invoke the headless migration command against your target URL:

```bash
/migrate-headless-payload <target-website-url>
```
*(Alternatively, you can run `/clone-website <target-url>` to generate only the static Next.js frontend without the CMS backend).*

### Step 3: The Phase 0 Storage Prompt
Immediately upon execution, the agent will pause and prompt you to choose your asset handling environment:

```text
Configure File Handling Environment for this migration test run:
  [local]  — Store uploads on local disk (cms/media/)
  [r2]     — Store uploads in Cloudflare R2 bucket
Enter choice (local / r2):
```
- Choosing **`local`** targets disk-based media volumes, keeping everything self-contained for local testing.
- Choosing **`r2`** wires up the `@payloadcms/plugin-cloud-storage` adapter to route all media uploads to a production Cloudflare R2 storage bucket.

---

## Output Artifacts Map

Upon a successful migration run, the tool outputs a fully scaffolded dual-engine architecture. Developers should look for the following artifacts:

| Output Artifact | Description |
|-----------------|-------------|
| `frontend/` | The locked, ISR-optimized Next.js 16 frontend folder. Features `generateStaticParams` and rigid fetch cache policies. |
| `backend/` | The standalone Payload 3.x backend workspace folder. Contains PostgreSQL schema files, RBAC access layers, and webhook configurations. |
| `docs/research/` | Left at root to house the initial reconnaissance maps (`data-migration-map.json`). |
| `docker-compose.yml` | The global coordinator managing the frontend, backend, and PostgreSQL containers. |

---

## Supported Platforms

| Agent | Status |
| ----- | ------ |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | **Recommended** — Opus 4.8 |
| [Codex CLI](https://github.com/openai/codex) | Supported |
| [OpenCode](https://opencode.ai/) | Supported |
| [GitHub Copilot](https://github.com/features/copilot) | Supported |
| [Cursor](https://cursor.com/) | Supported |
| [Windsurf](https://codeium.com/windsurf) | Supported |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Supported |
| [Cline](https://github.com/cline/cline) | Supported |
| [Roo Code](https://github.com/RooCodeInc/Roo-Code) | Supported |
| [Continue](https://continue.dev/) | Supported |
| [Amazon Q](https://aws.amazon.com/q/developer/) | Supported |
| [Augment Code](https://www.augmentcode.com/) | Supported |
| [Aider](https://aider.chat/) | Supported |

---

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict, Standalone build output
- **Payload CMS 3.x** — Code-first configuration, Lexical editor, RBAC, ISR Webhooks
- **PostgreSQL 16** — Shared database backend (`@payloadcms/db-postgres`)
- **UI & Styling** — shadcn/ui, Tailwind CSS v4 (oklch design tokens)
- **Cloud Storage** — Cloudflare R2 (optional, via `@payloadcms/plugin-cloud-storage`)

---

## Commands

```bash
cd frontend && npm run dev       # Start Next.js frontend dev server
cd frontend && npm run build     # Compile production Next.js frontend
cd frontend && npm run check     # Run lint + typecheck + build
```

### Docker Infrastructure

Run the full dual-engine stack (Frontend, CMS, Postgres) securely via Docker:

```bash
docker compose up -d           # Run the full production-ready stack
docker compose up dev --build  # Run frontend in dev mode on port 3001
```

---

## Updating Rules and Commands

If you make manual adjustments to the AI agent rules or skill blueprints, regenerate the platform-specific output files using these commands:

| Target | Source of Truth | Synchronization Command |
|--------|-----------------|-------------------------|
| Global Rules | `AGENTS.md` | `bash scripts/sync-agent-rules.sh` |
| AI Skills | `.claude/skills/*/SKILL.md` | `node scripts/sync-skills.mjs` |

---

## License

MIT
