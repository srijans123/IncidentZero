#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f upload/VERSION.txt ]; then
  echo "1.0" > upload/VERSION.txt
  NEXT_VER="1.0"
else
  PY_CMD="python3"
  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
    PY_CMD="python"
  fi
  NEXT_VER=$($PY_CMD -c '
import pathlib
p = pathlib.Path("upload/VERSION.txt")
raw = p.read_text().strip()
parts = raw.split(".")
major = int(parts[0]) if parts[0].isdigit() else 1
minor = int(parts[1]) + 1 if len(parts) > 1 and parts[1].isdigit() else 1
new_v = f"{major}.{minor}"
p.write_text(new_v + "\n")
print(new_v)
')
fi

MSG="${1:-Team sync update}"
USER_NAME=$(git config user.name || whoami || echo "teammate")
TS=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
touch upload/CHANGELOG.md
echo "- **v${NEXT_VER}** (${TS}) by \`${USER_NAME}\`: ${MSG}" >> upload/CHANGELOG.md

git add -A
git commit -m "Release v${NEXT_VER}: ${MSG}" || echo "No new file changes to commit; tagging v${NEXT_VER}"
git tag -f "v${NEXT_VER}"

if git remote get-url origin >/dev/null 2>&1; then
  git pull --rebase origin main || true
  git push -u origin main
  git push origin "v${NEXT_VER}" --force
  if command -v gh >/dev/null 2>&1; then
    gh release create "v${NEXT_VER}" --title "Version ${NEXT_VER}" --notes "${MSG} (by ${USER_NAME} at ${TS})" 2>/dev/null || true
  fi
  echo "✅ Successfully uploaded Version v${NEXT_VER} to Private GitHub repo!"
else
  echo "⚠️ Local commit & tag v${NEXT_VER} created, but git remote 'origin' is not set yet."
fi
