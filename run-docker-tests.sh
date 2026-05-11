#!/usr/bin/env bash
# run-docker-tests.sh
# Runs all test suites and npm validations inside a Docker container.
#
# Each validation step executes in an isolated Docker environment using
# named volumes to share node_modules and dist across steps, avoiding
# redundant installs. Volumes are removed automatically on exit.
#
# Usage:
#   ./run-docker-tests.sh [--no-cleanup]
#
# Options:
#   --no-cleanup   Keep Docker volumes after the run (useful for debugging)

set -uo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

readonly IMAGE="node:22-alpine"
readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly CONTAINER_APP="/app"
readonly VOL_MODULES="paraty_geoservices_node_modules"
readonly VOL_DIST="paraty_geoservices_dist"

NO_CLEANUP=false
if [[ "${1:-}" == "--no-cleanup" ]]; then
  NO_CLEANUP=true
fi

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Tracking
# ---------------------------------------------------------------------------

PASSED=()
FAILED=()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

header() {
  echo ""
  echo -e "${CYAN}${BOLD}▶ $1${NC}"
  echo -e "${CYAN}────────────────────────────────────────${NC}"
}

mark_pass() { echo -e "${GREEN}✔ PASS: $1${NC}"; PASSED+=("$1"); }
mark_fail() { echo -e "${RED}✘ FAIL: $1${NC}"; FAILED+=("$1"); }

cleanup() {
  if [[ "$NO_CLEANUP" == true ]]; then
    echo -e "\n${YELLOW}--no-cleanup: Docker volumes preserved (${VOL_MODULES}, ${VOL_DIST})${NC}"
    return
  fi
  echo -e "\n${YELLOW}Removing Docker volumes...${NC}"
  docker volume rm "$VOL_MODULES" "$VOL_DIST" 2>/dev/null || true
}

# Run a single validation step inside Docker.
# Shares source (read-only bind mount), node_modules and dist (named volumes).
run_step() {
  local name="$1"
  local cmd="$2"

  header "$name"

  if docker run --rm \
      --mount "type=bind,source=${PROJECT_ROOT},target=${CONTAINER_APP},readonly" \
      --mount "type=volume,source=${VOL_MODULES},target=${CONTAINER_APP}/node_modules" \
      --mount "type=volume,source=${VOL_DIST},target=${CONTAINER_APP}/dist" \
      -w "$CONTAINER_APP" \
      "$IMAGE" \
      sh -c "$cmd"; then
    mark_pass "$name"
  else
    mark_fail "$name"
  fi
}

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

if ! command -v docker &>/dev/null; then
  echo -e "${RED}Error: Docker is not installed or not in PATH.${NC}" >&2
  exit 1
fi

if ! docker info &>/dev/null; then
  echo -e "${RED}Error: Docker daemon is not running or the current user lacks access.${NC}" >&2
  exit 1
fi

trap cleanup EXIT

# ---------------------------------------------------------------------------
# Banner
# ---------------------------------------------------------------------------

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  paraty_geoservices — Docker CI Runner   ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo -e "  Image   : ${IMAGE}"
echo -e "  Project : ${PROJECT_ROOT}"

# ---------------------------------------------------------------------------
# Prepare shared volumes
# ---------------------------------------------------------------------------

docker volume create "$VOL_MODULES" &>/dev/null
docker volume create "$VOL_DIST"    &>/dev/null

# ---------------------------------------------------------------------------
# Validation steps
# ---------------------------------------------------------------------------

run_step "npm ci"                 "npm ci"
run_step "npm run build"          "npm run build"
run_step "npm test"               "npm test"
run_step "npm run test:coverage"  "npm run test:coverage"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  SUMMARY                                 ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"

for s in "${PASSED[@]+"${PASSED[@]}"}"; do
  echo -e "  ${GREEN}✔ $s${NC}"
done

for s in "${FAILED[@]+"${FAILED[@]}"}"; do
  echo -e "  ${RED}✘ $s${NC}"
done

echo ""
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}All ${#PASSED[@]} validation(s) passed.${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}${#FAILED[@]} of $((${#PASSED[@]} + ${#FAILED[@]})) validation(s) failed.${NC}"
  exit 1
fi
