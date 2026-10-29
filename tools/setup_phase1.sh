#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== 1. Cloning / Setting up Skills ==="
mkdir -p .agent/skills/taste-skill .agent/skills/impeccable .agent/skills/playwright-cli .agent/skills/img2threejs docs/ui-audit frontend/design-refs .img2threejs /tmp/awesome-design-md

git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git /tmp/taste-skill 2>/dev/null || true
if [ -d /tmp/taste-skill/skills/taste-skill ]; then
  cp -r /tmp/taste-skill/skills/taste-skill/* .agent/skills/taste-skill/ 2>/dev/null || true
elif [ -d /tmp/taste-skill ]; then
  cp -r /tmp/taste-skill/* .agent/skills/taste-skill/ 2>/dev/null || true
fi

git clone --depth 1 https://github.com/pbakaus/impeccable.git /tmp/impeccable 2>/dev/null || true
if [ -d /tmp/impeccable/dist/antigravity/.agent ]; then
  cp -r /tmp/impeccable/dist/antigravity/.agent/* .agent/ 2>/dev/null || true
elif [ -d /tmp/impeccable ]; then
  cp -r /tmp/impeccable/* .agent/skills/impeccable/ 2>/dev/null || true
fi

git clone --depth 1 https://github.com/microsoft/playwright-cli.git /tmp/playwright-cli 2>/dev/null || true
if [ -d /tmp/playwright-cli/skills/playwright-cli ]; then
  cp -r /tmp/playwright-cli/skills/playwright-cli/* .agent/skills/playwright-cli/ 2>/dev/null || true
elif [ -d /tmp/playwright-cli ]; then
  cp -r /tmp/playwright-cli/* .agent/skills/playwright-cli/ 2>/dev/null || true
fi

git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git /tmp/awesome-design-md 2>/dev/null || true

git clone --depth 1 https://github.com/img2threejs/img2threejs.git /tmp/img2threejs 2>/dev/null || true
if [ -d /tmp/img2threejs ]; then
  cp -r /tmp/img2threejs/* .agent/skills/img2threejs/ 2>/dev/null || true
fi

echo "=== 2. Installing Three.js and Frontend Dependencies ==="
cd frontend
npm install --legacy-peer-deps three @types/three @react-three/fiber @react-three/drei lucide-react clsx tailwind-merge

echo "=== Phase 1 Environment & Dependencies Ready ==="
