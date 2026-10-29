#!/usr/bin/env bash
set -e
export JAVA_HOME='/c/Users/Srijan Shukla/.jdks/corretto-22.0.2'
export PATH="/c/Users/Srijan Shukla/Documents/OOP Proj/tools/apache-maven-3.9.9/bin:$JAVA_HOME/bin:$PATH"

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

cd backend
mvn -B test -Dtest="$1"
