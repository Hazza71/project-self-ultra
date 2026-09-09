#!/usr/bin/env bash
# Decode tmp/psx-bundle.b64 (base64 gzip tarball of data/ + docs/) into the repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
B64="$ROOT/tmp/psx-bundle.b64"
if [[ ! -s "$B64" ]]; then
  echo "Missing $B64 — append the provided base64 parts first." >&2
  exit 1
fi
mkdir -p "$ROOT/tmp/decoded"
base64 -d "$B64" | gzip -dc | tar -xvf - -C "$ROOT/tmp/decoded"
# Copy canonical data and docs into place without rewriting taxonomy.
if [[ -f "$ROOT/tmp/decoded/data/canonical_data.json" ]]; then
  mkdir -p "$ROOT/data" "$ROOT/apps/mobile/assets"
  cp "$ROOT/tmp/decoded/data/canonical_data.json" "$ROOT/data/canonical_data.json"
  cp "$ROOT/tmp/decoded/data/canonical_data.json" "$ROOT/apps/mobile/assets/canonical_data.json"
  echo "Installed data/canonical_data.json"
fi
if [[ -d "$ROOT/tmp/decoded/docs" ]]; then
  mkdir -p "$ROOT/docs"
  cp -R "$ROOT/tmp/decoded/docs/." "$ROOT/docs/"
  echo "Installed docs/"
fi
# Also accept a tarball that extracts files at the root of decoded/
for f in MASTER_BLUEPRINT.md REQUIREMENTS_CHECKLIST.md BUILD_PROMPT_FOR_GROKBOT.md manifest.json; do
  if [[ -f "$ROOT/tmp/decoded/$f" ]]; then
    cp "$ROOT/tmp/decoded/$f" "$ROOT/docs/$f"
  fi
done
if [[ -f "$ROOT/tmp/decoded/canonical_data.json" ]]; then
  cp "$ROOT/tmp/decoded/canonical_data.json" "$ROOT/data/canonical_data.json"
  cp "$ROOT/tmp/decoded/canonical_data.json" "$ROOT/apps/mobile/assets/canonical_data.json"
fi
echo "Done."
