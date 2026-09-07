#!/usr/bin/env node
/**
 * Shrink every zome wasm with `wasm-opt -Oz`, in place.
 *
 * Integrity zomes are optimised too, and that is deliberate. A DNA's hash is
 * derived from its integrity zomes, so this build produces a different hash
 * from a plain `npm run build:happ` — a different network. That separation is
 * the point:
 *
 *   - The DNA published by the release workflow is the canonical one. Everyone
 *     installing acorn from a release joins that network.
 *   - A local `build:happ` / `applet-dev` build is for development only, and
 *     must NOT land on the canonical network. Half-finished work has no
 *     business gossiping into a community's archive.
 *
 * So the hash divergence is a feature, not a cost to be engineered around.
 * Anything intended to reach real users has to come from a release artifact.
 *
 * Which zomes exist is read from the DNA manifest rather than guessed from
 * file names, so a zome added later is covered automatically.
 *
 * Needs `wasm-opt` on PATH — the flake provides it via `binaryen`, so run this
 * inside `nix develop`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, renameSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { load } from 'js-yaml';

const MANIFEST = 'happs/happ/workdir/dna/projects/dna.yaml';

const manifest = load(readFileSync(MANIFEST, 'utf8'));
const base = dirname(resolve(MANIFEST));

const zomes = [
  ...(manifest?.integrity?.zomes ?? []).map((z) => ({ ...z, kind: 'integrity' })),
  ...(manifest?.coordinator?.zomes ?? []).map((z) => ({ ...z, kind: 'coordinator' })),
].map((z) => ({ name: z.name, kind: z.kind, path: resolve(base, z.path) }));

if (zomes.length === 0) {
  console.error(`No zomes found in ${MANIFEST}`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const zome of zomes) {
  const sizeBefore = statSync(zome.path).size;
  const tmp = `${zome.path}.opt`;
  execFileSync('wasm-opt', ['-Oz', '--strip-debug', '--strip-producers', zome.path, '-o', tmp], {
    stdio: 'inherit',
  });
  const sizeAfter = statSync(tmp).size;
  renameSync(tmp, zome.path);

  before += sizeBefore;
  after += sizeAfter;
  const pct = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1);
  console.log(
    `  ${zome.name.padEnd(24)} ${zome.kind.padEnd(12)} ` +
      `${(sizeBefore / 1024).toFixed(0).padStart(6)} KB -> ` +
      `${(sizeAfter / 1024).toFixed(0).padStart(6)} KB  (-${pct}%)`,
  );
}

const pct = (((before - after) / before) * 100).toFixed(1);
console.log(
  `\n  total${' '.repeat(31)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ` +
    `${(after / 1024).toFixed(0).padStart(6)} KB  (-${pct}%)`,
);
console.log(
  '\n  Integrity zomes were optimised, so this DNA hash differs from a plain\n' +
    '  build:happ. That is intended: the release DNA is the canonical network,\n' +
    '  and local dev builds deliberately do not join it.',
);
