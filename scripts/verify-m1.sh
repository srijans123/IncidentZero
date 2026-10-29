#!/usr/bin/env bash
set -euo pipefail
if [ -z "${JAVA_HOME:-}" ] && [ -d "/c/Users/Srijan Shukla/.jdks/corretto-22.0.2" ]; then
  export JAVA_HOME="/c/Users/Srijan Shukla/.jdks/corretto-22.0.2"
  export PATH="$PWD/tools/apache-maven-3.9.9/bin:$JAVA_HOME/bin:$PATH"
fi
mkdir -p /tmp/iitsm-m1-classes
find backend/src/main/java \
  \( -path "*/domain/*.java" \
     -o -path "*/application/priority/*.java" \
     -o -path "*/incident/api/*.java" \
     -o -path "*/assignment/api/*.java" \
     -o -path "*/sla/api/*.java" \
     -o -path "*/intelligence/api/*.java" \
     -o -path "*/intake/application/IntakeStep.java" \
     -o -path "*/incident/application/CommandAuthorizer.java" \) \
  ! -name "package-info.java" > /tmp/iitsm-m1-sources.txt
javac -d /tmp/iitsm-m1-classes @/tmp/iitsm-m1-sources.txt backend/src/test/java/Verify.java
OUT=$(java -cp /tmp/iitsm-m1-classes Verify)
echo "$OUT"
echo "$OUT" | grep -F "SUMMARY: 24 passed, 0 failed"
