#!/usr/bin/env bash
# deploy.sh
# Builds and deploys paraty_geoservices for CDN delivery via jsDelivr (GitHub source).
#
# Strategy: creates a local release branch containing the built dist/ files,
# tags it, pushes the tag to GitHub, then removes the branch locally.
# jsDelivr resolves the tag at: https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/
#
# Usage:
#   ./scripts/deploy.sh [--dry-run]
#
# Options:
#   --dry-run   Simulate the deployment without pushing to GitHub

set -euo pipefail

# ── Cleanup ───────────────────────────────────────────────────────────────────
cleanup() {
  rm -f "${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}/.npmrc"
}
trap cleanup EXIT

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# ── Colour helpers ────────────────────────────────────────────────────────────
# shellcheck source=scripts/colors.sh
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
info()  { echo -e "${BLUE}[deploy]${NC} $*"; }
ok()    { echo -e "${GREEN}[deploy] ✓${NC} $*"; }
warn()  { echo -e "${YELLOW}[deploy] ⚠${NC} $*"; }
fail()  { echo -e "${RED}[deploy] ✗${NC} $*" >&2; exit 1; }

CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

command -v npm >/dev/null 2>&1 || fail "npm not found on PATH."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly PROJECT_ROOT

cd "$PROJECT_ROOT"

# ── Read version info ─────────────────────────────────────────────────────────
PACKAGE_NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
PRERELEASE="$(node -p "('$VERSION'.match(/-([\w]+)/)||[])[1]||''")"
NPM_TAG="${PRERELEASE:-latest}"
TAG="v${VERSION}"
GH_REPO="mpbarbosa/paraty_geoservices"
REPO_URL="$(git remote get-url origin)"
REPO="$(echo "$REPO_URL" | sed -E 's|.*github\.com[:/]([^/]+/[^/]+?)(\.git)?$|\1|')"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
STASHED=false

cleanup() {
  local exit_code=$?
  trap - EXIT
  git checkout "$CURRENT_BRANCH" 2>/dev/null || true
  git branch -D "release/${TAG}" 2>/dev/null || true
  [[ "$STASHED" == true ]] && { git stash pop 2>/dev/null || true; }
  exit $exit_code
}
trap cleanup EXIT

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  paraty_geoservices — CDN Deploy         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""
info "Project root : ${PROJECT_ROOT}"
info "Package      : $PACKAGE_NAME"
info "Version      : $VERSION"
info "dist-tag     : $NPM_TAG"
info "Git tag      : $TAG"
info "Repo         : github.com/${REPO}"
[[ "$DRY_RUN" == true ]] && echo -e "  Mode    : ${CYAN}dry-run${NC}"

# ── Guard: clean working tree ─────────────────────────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Working tree is dirty. Commit or stash your changes first."
fi

# ── Guard: check whether tag already exists and whether it has been delivered ──
TAG_EXISTS_LOCALLY=false
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  TAG_EXISTS_LOCALLY=true
  if git ls-remote --tags origin "refs/tags/${TAG}" 2>/dev/null | grep -q .; then
    warn "Tag ${TAG} already exists and is already on the remote."
    warn "Skipping build/test/tag steps — resuming from CDN delivery step."
    echo ""
  else
    warn "Tag ${TAG} exists locally but has not been pushed to the remote yet."
    warn "Skipping build/test steps and resuming from CDN delivery (push) step."
    echo ""
  fi
fi

if [[ "${TAG_EXISTS_LOCALLY}" == "false" ]]; then
  # ── Step 1/6 — Install + Validate ──────────────────────────────────────────
  info "Step 1/6 — Installing dependencies and type-checking …"
  npm ci --prefer-offline --no-audit
  npm run validate || fail "Type-check failed. Aborting deploy."
  ok "Dependencies installed and types valid"
  echo ""

  # ── Step 2/6 — Test ────────────────────────────────────────────────────────
  info "Step 2/6 — Running tests …"
  npm test || fail "Tests failed. Aborting deploy."
  ok "Tests passed"
  echo ""

echo ""
echo -e "${CYAN}${BOLD}▶ Building project...${NC}"
npm run build

echo ""
echo -e "${CYAN}${BOLD}▶ Creating release commit on branch release/${TAG}...${NC}"
git checkout -B "release/${TAG}"
git add -f dist/
git commit -m "chore: release ${TAG} for CDN deployment

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git tag "${TAG}"

echo ""
echo -e "${CYAN}${BOLD}▶ Pushing tag ${TAG} to GitHub...${NC}"
if [[ "$DRY_RUN" == true ]]; then
  echo "  [dry-run] git push origin ${TAG}"
else
  git push origin "${TAG}"
fi

echo ""
echo -e "${GREEN}${BOLD}Deployment complete.${NC}"
echo ""
echo -e "  jsDelivr CDN URLs (available within a few minutes):"
echo -e "  ${CYAN}https://cdn.jsdelivr.net/gh/${REPO}@${TAG}/dist/index.js${NC}"
echo -e "  ${CYAN}https://cdn.jsdelivr.net/gh/${REPO}@${TAG}/dist/index.d.ts${NC}"
