#!/usr/bin/env bash
# Run all three Oracle services (backend, frontend, oracle-landing) in parallel.
#
# Usage:
#   ./dev.sh              — starts all three
#   ./dev.sh backend      — starts backend only
#   ./dev.sh frontend     — starts frontend only
#   ./dev.sh landing      — starts oracle-landing only

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

case "${1:-all}" in
  backend)
    cd "$ROOT/backend" && npm run dev
    ;;
  frontend)
    cd "$ROOT/frontend" && npm run dev
    ;;
  landing)
    cd "$ROOT/oracle-landing" && npm run dev
    ;;
  all)
    echo "Starting backend + frontend + oracle-landing..."
    npx --yes concurrently \
      --names "backend,frontend,landing" \
      --prefix-colors "cyan,magenta,yellow" \
      "npm run dev --prefix \"$ROOT/backend\"" \
      "npm run dev --prefix \"$ROOT/frontend\"" \
      "npm run dev --prefix \"$ROOT/oracle-landing\""
    ;;
  *)
    echo "Unknown argument: $1"
    echo "Usage: ./dev.sh [all|backend|frontend|landing]"
    exit 1
    ;;
esac
