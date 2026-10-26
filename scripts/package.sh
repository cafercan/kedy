#!/usr/bin/env bash
# Builds dist/kedy-chrome-extension-v<version>.zip with only the files Chrome needs,
# plus dist/SHA256SUMS.txt (C Launcher verifies the zip against it).
set -euo pipefail
cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
out="dist/kedy-chrome-extension-v$version.zip"
files=(manifest.json background.js content.js content.css README.md LICENSE icons popup)

rm -rf dist
mkdir dist
zip -qrX "$out" "${files[@]}"
(cd dist && sha256sum "$(basename "$out")" > SHA256SUMS.txt)
echo "$out"
