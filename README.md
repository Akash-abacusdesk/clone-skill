# Website Reverse-Engineer & Headless Migration Template

<a href="https://github.com/Akash-abacusdesk/clone-skill/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a> <a href="https://github.com/Akash-abacusdesk/clone-skill/stargazers"><img src="https://img.shields.io/github/stars/Akash-abacusdesk/clone-skill?style=flat" alt="Stars" /></a>

This repository is an **automated headless migration engine**. It leverages AI coding agents to reverse-engineer any website and migrate it into a production-ready, twin-engine codebase built on **Next.js 16** (standalone output), **Tailwind CSS v4**, and **Payload CMS 3.x** backed by a **PostgreSQL** database layer.

## Core Architecture Philosophy: Split-Control

The migration process is governed by a strict **split-control architecture**:
- **Serverless Frontend Engine**: The Next.js frontend is built as a static/ISR layer and deployed directly to a serverless global CDN (like Cloudflare Pages), bypassing VPS resource footprints entirely. The AI Agent codes pixel-perfect frontend layouts where the CMS client has **0% UI layout control**. 
- **Isolated Backend Data Container**: The backend Payload 3.x instance runs as an isolated, resource-constrained container on a dedicated Linux VPS, linked to a centralized PostgreSQL instance. It enforces strict Role-Based Access Control (RBAC) boundaries, ensuring the layout structure remains untouched while empowering clients to manage dynamic collections.
- **Rigid ISR via Webhooks**: The CDN frontend is fully optimized for Incremental Static Regeneration (ISR). The migration engine pre-renders all dynamic routes at build time via programmatic `generateStaticParams()` and invalidates cache on-demand via secure webhook integration on every CMS update.

---

## Step-by-Step Usage Instructions

> **Important:** Do not clone this template repository directly. Use GitHub's **Use this template** button to create your own copy first.

After downloading and opening your new repository locally, you must install dependencies for both engines separately:

```bash
cd frontend && npm install
cd ../backend && npm install
```

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
| `frontend/` | The CDN-targeted Next.js source folder. Built for static/ISR deployment to a global CDN like Cloudflare Pages. |
| `backend/` | The VPS-targeted Docker workspace container source. Contains Payload 3.x schemas, PostgreSQL links, and RBAC layers. |
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
# Local Development
cd frontend && npm run dev       # Launch frontend development server
cd backend && npm run dev        # Launch backend CMS development server

# Production Compilations
cd frontend && npm run build     # Verify CDN-ready Next.js static compilation
```

### Docker Infrastructure

The `docker-compose.yml` file is designed specifically for your host VPS. It manages only the backend services (the CMS container and the shared `postgres` service), while frontend builds are handled directly via your CDN's Git integration.

```bash
# VPS Production Backend Controls
docker compose up -d backend db  # Spin up the CMS container and the Postgres instance on the VPS
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
