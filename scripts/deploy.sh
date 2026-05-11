#!/usr/bin/env bash
# deploy.sh
# Builds and publishes paraty_geoservices to npm.
#
# Usage:
#   ./scripts/deploy.sh [--dry-run]
#
# Options:
#   --dry-run   Run npm publish with --dry-run flag (no actual publish)

set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

cd "$PROJECT_ROOT"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  paraty_geoservices — Deploy             ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo -e "  Project : ${PROJECT_ROOT}"
[[ "$DRY_RUN" == true ]] && echo -e "  Mode    : ${CYAN}dry-run${NC}"

echo ""
echo -e "${CYAN}${BOLD}▶ Building project...${NC}"
npm run build

echo ""
echo -e "${CYAN}${BOLD}▶ Publishing to npm...${NC}"
if [[ "$DRY_RUN" == true ]]; then
  npm publish --dry-run
else
  npm publish
fi

echo ""
echo -e "${GREEN}${BOLD}Deployment complete.${NC}"
