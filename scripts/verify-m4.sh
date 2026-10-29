#!/usr/bin/env bash
set -euo pipefail
cd backend
AI_PROVIDER=replay mvn -B test -Dtest="*Gateway*Test,*Duplicate*Test,*Rag*Test"
AI_PROVIDER=off mvn -B test -Dtest="*Gateway*Test"
