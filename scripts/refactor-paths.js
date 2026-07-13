const fs = require('fs');
const path = '.claude/skills/migrate-headless-payload/SKILL.md';
let content = fs.readFileSync(path, 'utf8');

// Replacements
content = content.replace(/cms\/media\//g, 'backend/media/');
content = content.replace(/cms\/, cms\/collections\/, cms\/globals\/, cms\/access\/, cms\/seed\//g, 'backend/, backend/src/collections/, backend/src/globals/, backend/src/access/, backend/src/seed/');
content = content.replace(/templates\/cms\//g, 'templates/backend/');
content = content.replace(/src\/lib\/payload\.ts/g, 'frontend/src/lib/payload.ts');
content = content.replace(/src\/types\/payload\.ts/g, 'frontend/src/types/payload.ts');
content = content.replace(/src\/app\//g, 'frontend/src/app/');
content = content.replace(/src\/types\//g, 'frontend/src/types/');
content = content.replace(/cms\/access\/rbac\.ts/g, 'backend/src/access/rbac.ts');
content = content.replace(/cms\/collections\//g, 'backend/src/collections/');
content = content.replace(/cms\/globals\/SiteConfig\.ts/g, 'backend/src/globals/SiteConfig.ts');
content = content.replace(/cms\/payload\.config\.ts/g, 'backend/payload.config.ts');
content = content.replace(/cms\/seed\/webhook-config\.ts/g, 'backend/src/seed/webhook-config.ts');
content = content.replace(/cms\/package\.json/g, 'backend/package.json');
content = content.replace(/cms\/tsconfig\.json/g, 'backend/tsconfig.json');
content = content.replace(/cd cms && npx tsc --noEmit/g, 'cd backend && npx tsc --noEmit');
content = content.replace(/in `cms\/` —/g, 'in `backend/` —');
content = content.replace(/run `npm run build`/g, 'run `cd frontend && npm run build`');
content = content.replace(/build: \.\/cms/g, 'build: ./backend');
content = content.replace(/generate the complete `cms\/`/g, 'generate the complete `backend/`');
content = content.replace(/build:\n      context: \.\/cms/g, 'build:\n      context: ./backend');

fs.writeFileSync(path, content);
console.log("Replaced paths in SKILL.md");
