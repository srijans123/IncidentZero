#!/usr/bin/env bash
set -euo pipefail
cd backend
mvn -B test -Dtest="*Priority*Test,*Sla*Test,*Assign*Test,*Audit*Test,*ArchitectureTest"
