#!/usr/bin/env bash
# Install site + CMS dependencies. Run from anywhere:
#   ./scripts/setup.sh
#   ./scripts/setup.sh --e2e
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec node scripts/setup.mjs "$@"
