#!/usr/bin/env bash
#
# One-time (per DNA version) bootstrap of the canonical, FROZEN happ release.
#
# Why this exists: the zome wasm embeds the original builder's absolute paths
# (~/.cargo/... and source file paths via the HDK macros), so the happ cannot be
# reproduced byte-for-byte on a different machine/user or in CI. Rebuilding
# elsewhere yields a DIFFERENT DNA hash, i.e. a DIFFERENT network. To keep every
# install on the same network we build the happ once and reuse those exact bytes
# forever.
#
# The canonical bytes are published as the `happ-v<dnaVersion>` GitHub release
# (tag in `.happ-version`) and their sha256 is recorded in `.happ-sha256`;
# release-webhapp.yaml downloads the former and checks it against the latter.
#
# Two sources, in order of preference:
#   1. `happs/happ/workdir/acorn.happ` from a local `yarn build:happ:release` — used when
#      bootstrapping a new DNA line (0.7 started one: Holochain 0.7 has no data
#      migration path, so its DNA hash and network are new by construction).
#      `build:happ:release` is the canonical build (it wasm-opts the zomes before
#      packing); plain `yarn build:happ` skips that and produces DIFFERENT bytes, which
#      the sha256 check below will reject. See RELEASE.md.
#   2. An already-published .webhapp, passed as the first argument — used to
#      recover the exact bytes of a line that is already live.
#
# Requirements: `hc` (enter `nix develop` first) and `gh` (authenticated).
# Usage: nix develop --command bash scripts/release-happ.sh [SOURCE_WEBHAPP_URL]
set -euo pipefail

HAPP_TAG=$(tr -d '[:space:]' < .happ-version)
EXPECTED_SHA=$(tr -d '[:space:]' < .happ-sha256)

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

if [ $# -ge 1 ]; then
  echo "Recovering canonical happ from: $1"
  curl -fsSL -o "$tmp/src.webhapp" "$1"
  hc web-app unpack "$tmp/src.webhapp" -o "$tmp/wa" >/dev/null
  happ="$tmp/wa/acorn.happ"
else
  happ="happs/happ/workdir/acorn.happ"
  if [ ! -f "$happ" ]; then
    echo "ERROR: $happ not found. Run 'yarn build:happ:release' first" >&2
    echo "(the canonical build; plain 'yarn build:happ' produces a different happ)," >&2
    echo "or pass the URL of a published .webhapp to recover it from." >&2
    exit 1
  fi
  echo "Using locally built happ: $happ"
fi

got=$(sha256sum "$happ" | awk '{print $1}')
if [ "$got" != "$EXPECTED_SHA" ]; then
  echo "ERROR: happ sha256 ($got) != canonical sha in .happ-sha256 ($EXPECTED_SHA)." >&2
  echo "Refusing to publish a happ that would change the DNA/network." >&2
  echo "If you are deliberately starting a NEW DNA line, bump 'dnaVersion' in" >&2
  echo "web/package.json, update .happ-version, write $got into .happ-sha256," >&2
  echo "and re-run. Everyone on the old DNA stays on the old network." >&2
  exit 1
fi
echo "Verified canonical happ sha256 = $got"

notes="Frozen canonical acorn.happ reused by every webhapp release to keep all installs on the same network. DNA sha256: $EXPECTED_SHA. Do NOT rebuild."

if gh release view "$HAPP_TAG" >/dev/null 2>&1; then
  echo "Release $HAPP_TAG already exists; uploading/clobbering the happ asset."
  gh release upload "$HAPP_TAG" "$happ" --clobber
  # The notes quote the sha, so they have to move with the asset — otherwise a
  # re-cut release advertises the previous DNA.
  gh release edit "$HAPP_TAG" --notes "$notes" >/dev/null
else
  gh release create "$HAPP_TAG" "$happ" \
    --title "Canonical happ $HAPP_TAG (frozen DNA)" \
    --notes "$notes"
fi
echo "Done. release-webhapp.yaml will download acorn.happ from $HAPP_TAG."
