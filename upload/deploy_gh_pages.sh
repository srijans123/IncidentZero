#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building frontend for GitHub Pages..."
cd frontend
npm run build
cd ..

TMP_DIR=$(mktemp -d)
echo "Copying build artifacts to temporary directory: ${TMP_DIR}"
cp -r frontend/dist/* "${TMP_DIR}/"

# Ensure root index.html is the landing page and app.html is the React app
cp "${TMP_DIR}/index.html" "${TMP_DIR}/app.html"
cp landing.html "${TMP_DIR}/index.html"
cp landing.html "${TMP_DIR}/landing.html"

cd "${TMP_DIR}"
git init -b gh-pages
git config user.name "$(git -C .. config user.name || echo 'srijans123')"
git config user.email "$(git -C .. config user.email || echo 'srijans123@users.noreply.github.com')"
git add -A
git commit -m "Deploy Incident-Zero to GitHub Pages"
git remote add origin https://github.com/srijans123/IncidentZero.git
git push origin gh-pages --force

cd - >/dev/null
rm -rf "${TMP_DIR}"
echo "✅ Successfully deployed to gh-pages branch!"

