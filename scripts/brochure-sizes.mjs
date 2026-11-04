// Writes src/config/brochure-sizes.generated.json (file name -> bytes) so the
// client bundle can show file sizes without shipping any filesystem code.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('../public/brochures/', import.meta.url));
const out = fileURLToPath(new URL('../src/config/brochure-sizes.generated.json', import.meta.url));
const sizes = {};
for (const f of readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf')).sort()) {
  sizes[f] = statSync(join(dir, f)).size;
}
writeFileSync(out, JSON.stringify(sizes, null, 2) + '\n');
console.log(`brochure sizes: ${Object.keys(sizes).length} files`);
