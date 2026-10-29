#!/usr/bin/env bash
set -euo pipefail
if [ -z "${JAVA_HOME:-}" ] && [ -d "/c/Users/Srijan Shukla/.jdks/corretto-22.0.2" ]; then
  export JAVA_HOME="/c/Users/Srijan Shukla/.jdks/corretto-22.0.2"
  export PATH="$PWD/../tools/apache-maven-3.9.9/bin:$PWD/tools/apache-maven-3.9.9/bin:$JAVA_HOME/bin:$PATH"
fi
cd backend
mvn -B test-compile
mvn -B test -Dtest=ArchitectureTest
