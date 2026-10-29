#!/usr/bin/env bash
set -euo pipefail
bash scripts/verify-m1.sh
cd frontend && npm run build
