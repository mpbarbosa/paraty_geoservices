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

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly PROJECT_ROOT

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

VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"
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
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  paraty_geoservices — CDN Deploy         ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo -e "  Project : ${PROJECT_ROOT}"
echo -e "  Version : ${TAG}"
echo -e "  Repo    : github.com/${REPO}"
[[ "$DRY_RUN" == true ]] && echo -e "  Mode    : ${CYAN}dry-run${NC}"

if git ls-remote --tags origin "refs/tags/${TAG}" | grep -q .; then
  echo -e "\n${RED}Error: tag ${TAG} already exists on remote. Bump the version in package.json.${NC}"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo ""
  echo -e "${CYAN}${BOLD}▶ Stashing uncommitted changes...${NC}"
  git stash push -u -m "deploy-stash-${TAG}"
  STASHED=true
fi

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
