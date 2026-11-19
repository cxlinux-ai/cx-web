import { mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadHowToPages, renderAllHowTo } from "../shared/howto/load";
import { renderManifest } from "../shared/howto/render";

/**
 * Writes the static /how-to pages from content/how-to/*.md into client/public/.
 *
 * Cloudflare Pages serves committed files only (its build does not run this script), so commit
 * the output. client/src/lib/howto.test.ts fails if the committed HTML drifts from the sources.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "client", "public");

const files = renderAllHowTo(ROOT);

const outDir = join(PUBLIC, "how-to");
mkdirSync(outDir, { recursive: true });
for (const stale of readdirSync(outDir)) {
  if (!files.has(`how-to/${stale}`)) rmSync(join(outDir, stale));
}
for (const [rel, html] of files) writeFileSync(join(PUBLIC, rel), html);
writeFileSync(join(ROOT, "shared", "howto", "manifest.ts"), renderManifest(loadHowToPages(ROOT).map((p) => p.slug)));

console.log(`✓ client/public/how-to.html + ${files.size - 1} pages in client/public/how-to/ + shared/howto/manifest.ts`);
