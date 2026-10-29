#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "============================================================"
echo "  Incident-Zero (I-ITSM v2.2) — Launching Application"
echo "============================================================"

# Load .env
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

# Configure JDK if not in PATH
if [ -z "${JAVA_HOME:-}" ] && [ -d "/c/Users/Srijan Shukla/.jdks/corretto-22.0.2" ]; then
  export JAVA_HOME="/c/Users/Srijan Shukla/.jdks/corretto-22.0.2"
fi
if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$PWD/tools/apache-maven-3.9.9/bin:$JAVA_HOME/bin:$PATH"
fi

echo "Starting Backend in background on http://localhost:8080..."
(cd backend && mvn spring-boot:run) &
BACKEND_PID=$!

echo "Starting Frontend on http://localhost:3000..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Opening http://localhost:3000 ..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT INT TERM
wait
