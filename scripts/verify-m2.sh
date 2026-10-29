#!/usr/bin/env bash
set -euo pipefail
cd backend
mvn -B test-compile
mvn -B test -Dtest=ArchitectureTest
