#!/usr/bin/env node

// Generates command/skill files for all supported AI coding platforms.
// Dynamically discovers all skills in .claude/skills/*/SKILL.md.
//
// Usage: node scripts/sync-skills.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, '.claude', 'skills');

// --- Discover all skills ---

function discoverSkills() {
  const skills = [];
  let entries;
  try {
    entries = readdirSync(SKILLS_DIR);
  } catch {
    console.error(`Error: Skills directory not found at .claude/skills/`);
    process.exit(1);
  }

  for (const entry of entries) {
    const skillDir = join(SKILLS_DIR, entry);
    const skillFile = join(skillDir, 'SKILL.md');
    try {
      if (statSync(skillDir).isDirectory() && statSync(skillFile).isFile()) {
        skills.push({ name: entry, path: skillFile });
      }
    } catch {
      // Skip entries that aren't valid skill directories
    }
  }

  if (skills.length === 0) {
    console.error('Error: No skills found in .claude/skills/*/SKILL.md');
    process.exit(1);
  }

  return skills;
}

// --- Parse a SKILL.md file ---

function parseSkill(skillPath, skillName) {
  let raw;
  try {
    raw = readFileSync(skillPath, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    console.error(`  ✗ Could not read ${skillPath}`);
    return null;
  }

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.error(`  ✗ Could not parse frontmatter in ${skillName}/SKILL.md`);
    return null;
  }

  // Extract description from frontmatter
  const frontmatter = match[1];
  const body = match[2];
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const shortDesc = descMatch
    ? descMatch[1].replace(/^["']|["']$/g, '').slice(0, 100)
    : `AI skill: ${skillName}`;

  return { raw, body, shortDesc, frontmatter };
}

// --- Helpers ---

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log(`    ✓ ${relPath}`);
}

const noArgs = (text) => text.replace(/\$ARGUMENTS/g, 'the target URL provided by the user');

// --- Generate platform files for a single skill ---

function generateForSkill(skillName, parsed) {
  const { raw, body, shortDesc } = parsed;

  const HEADER =
    `<!-- AUTO-GENERATED from .claude/skills/${skillName}/SKILL.md — do not edit directly.\n` +
    '     Run `node scripts/sync-skills.mjs` to regenerate. -->\n\n';

  // 1. Codex CLI — same SKILL.md format, same $ARGUMENTS syntax
  write(`.codex/skills/${skillName}/SKILL.md`, raw);

  // 2. GitHub Copilot — same SKILL.md format
  write(`.github/skills/${skillName}/SKILL.md`, raw);

  // 3. Cursor — plain markdown, no argument substitution support
  write(`.cursor/commands/${skillName}.md`, HEADER + noArgs(body));

  // 4. Windsurf — markdown workflow
  write(`.windsurf/workflows/${skillName}.md`, HEADER + noArgs(body));

  // 5. Gemini CLI — TOML format, {{args}} for arguments
  const geminiBody = body.replace(/\$ARGUMENTS/g, '{{args}}');
  write(
    `.gemini/commands/${skillName}.toml`,
    `# AUTO-GENERATED from .claude/skills/${skillName}/SKILL.md\n` +
      `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
      `description = "${shortDesc}"\n` +
      `name = "${skillName}"\n\n` +
      `prompt = '''\n${geminiBody}\n'''\n`
  );

  // 6. OpenCode — markdown + YAML frontmatter, $ARGUMENTS works natively
  write(
    `.opencode/commands/${skillName}.md`,
    `---\ndescription: "${shortDesc}"\n---\n${HEADER}${body}`
  );

  // 7. Augment Code — markdown + YAML frontmatter
  write(
    `.augment/commands/${skillName}.md`,
    `---\ndescription: "${shortDesc}"\nargument-hint: "<url>"\n---\n${HEADER}${body}`
  );

  // 8. Continue — prompt file with invokable: true
  write(
    `.continue/commands/${skillName}.md`,
    `---\nname: ${skillName}\ndescription: "${shortDesc}"\ninvokable: true\n---\n${HEADER}${body}`
  );

  // 9. Amazon Q — JSON agent definition
  write(
    `.amazonq/cli-agents/${skillName}.json`,
    JSON.stringify(
      {
        name: skillName,
        description: shortDesc,
        prompt: noArgs(body),
        fileContext: ['AGENTS.md', 'docs/research/**'],
      },
      null,
      2
    ) + '\n'
  );
}

// --- Main ---

console.log('Discovering skills in .claude/skills/...\n');

const skills = discoverSkills();

console.log(`Found ${skills.length} skill(s):\n`);

let totalFiles = 0;

for (const skill of skills) {
  console.log(`  📦 ${skill.name}`);
  const parsed = parseSkill(skill.path, skill.name);
  if (parsed) {
    generateForSkill(skill.name, parsed);
    totalFiles += 9;
  }
  console.log('');
}

console.log(`Done! ${totalFiles} platform command files generated from ${skills.length} source skill(s).`);
