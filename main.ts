// The entry's program (Node 22, standard library only): it copies this repository's app/ and screenshots/ to the
// hand-in directory (/output, or MAKEFUN_OUTPUT_DIR outside the grader) and writes the dossier the judge reads with
// the vendored make.fun library. `MAKEFUN_OUTPUT_DIR=out node main.ts` runs it locally.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json). text_max_bytes shapes the dossier's bytes; the rest refuse here an
// entry the scorer would refuse: more than 3 screenshots, one over 256 KiB, or app/ past its file and byte caps.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 3, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

console.log(`wrote ${out}/dossier.json`);
