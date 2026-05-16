#!/usr/bin/env bash
# deploy.sh
# Builds and deploys paraty_geoservices for CDN delivery via jsDelivr (GitHub source).
#
# Strategy: force-adds the built dist/ files to a commit on the current branch,
# tags it, and pushes the tag to GitHub.
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
echo ""

# ── Guard: clean working tree ─────────────────────────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Working tree is dirty. Commit or stash your changes first."
fi

# ── Guard: check whether tag already exists and whether it has been delivered ──
TAG_EXISTS_LOCALLY=false
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  TAG_EXISTS_LOCALLY=true
  if git ls-remote --tags origin "refs/tags/${TAG}" 2>/dev/null | grep -q .; then
    warn "Tag ${TAG} already exists on the remote."
    warn "Skipping install/test — build will still run to ensure dist/ is current."
    echo ""
  else
    warn "Tag ${TAG} exists locally but has not been pushed to the remote yet."
    warn "Skipping install/test — build will still run to ensure dist/ is current."
    echo ""
  fi
fi

# ── Helper: does the tag's commit tree already include build artifacts? ────────
_tag_has_artifacts() {
  git ls-tree -r "${TAG}" --name-only 2>/dev/null | grep -q "^dist/index\.js$"
}

if [[ "${TAG_EXISTS_LOCALLY}" == "false" ]]; then
  # ── Step 1/5 — Install + Validate ──────────────────────────────────────────
  info "Step 1/5 — Installing dependencies and type-checking …"
  npm ci --prefer-offline --no-audit
  npm run validate || fail "Type-check failed. Aborting deploy."
  ok "Dependencies installed and types valid"
  echo ""

  # ── Step 2/5 — Test ────────────────────────────────────────────────────────
  info "Step 2/5 — Running tests …"
  npm test || fail "Tests failed. Aborting deploy."
  ok "Tests passed"
  echo ""
else
  info "Step 1/5 — Skipped (tag already built locally)"
  info "Step 2/5 — Skipped (tag already built locally)"
  echo ""
fi

# ── Step 3/5 — Build (CJS + ESM) — always runs to keep dist/ current ─────────
info "Step 3/5 — Building CJS and ESM bundles …"
npm run build     || fail "CJS build failed. Aborting deploy."
npm run build:esm || fail "ESM build failed. Aborting deploy."
ok "Build complete (dist/ · dist/esm/)"
echo ""

# ── Step 4/5 — CDN delivery (commit artifacts, tag & push to GitHub) ─────────
info "Step 4/5 — Enabling CDN delivery via GitHub …"

if [[ -z "${CURRENT_BRANCH}" ]]; then
  fail "Could not determine current git branch (detached HEAD?)"
fi

# Force-add compiled dist/ artifacts (dist/ is in .gitignore but must be
# committed to the GitHub tag for jsDelivr CDN delivery to work)
git add -f dist/
if git diff --cached --quiet; then
  warn "Build artifacts unchanged — skipping commit"
else
  if [[ "$DRY_RUN" == true ]]; then
    info "[dry-run] Would commit build artifacts for ${TAG}"
    git reset HEAD dist/ >/dev/null
  else
    git commit -m "chore: build artifacts for ${TAG}

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
    ok "Committed build artifacts"
  fi
fi

if [[ "$DRY_RUN" == true ]]; then
  info "[dry-run] Would pull --rebase origin ${CURRENT_BRANCH}"
else
  git pull --rebase origin "${CURRENT_BRANCH}"
fi

# Determine whether the tag needs to be (re)created and force-pushed.
# An existing tag that was created before the artifact commit lacks dist/
# in its tree and must be replaced so jsDelivr can serve the files.
TAG_NEEDS_FORCE_PUSH=false
if [[ "${TAG_EXISTS_LOCALLY}" == "false" ]]; then
  if [[ "$DRY_RUN" == true ]]; then
    info "[dry-run] Would create tag ${TAG}"
  else
    git tag -a "${TAG}" -m "Release ${TAG}"
    ok "Created tag ${TAG}"
  fi
elif ! _tag_has_artifacts; then
  warn "Existing tag ${TAG} lacks build artifacts — recreating to include them"
  if [[ "$DRY_RUN" == true ]]; then
    info "[dry-run] Would delete and re-create tag ${TAG} pointing to HEAD"
  else
    git tag -d "${TAG}"
    git tag -a "${TAG}" -m "Release ${TAG}"
    ok "Re-created tag ${TAG} → HEAD (now includes build artifacts)"
  fi
  TAG_NEEDS_FORCE_PUSH=true
else
  info "Reusing existing tag ${TAG} (already contains build artifacts)"
fi

# Push branch first (covers any new artifact commit), then the tag.
# A re-created tag must be force-pushed since the remote already has the old one.
if [[ "$DRY_RUN" == true ]]; then
  info "[dry-run] Would push origin/${CURRENT_BRANCH} with tag ${TAG}${TAG_NEEDS_FORCE_PUSH:+ (force)}"
else
  git push origin "${CURRENT_BRANCH}"
  if [[ "${TAG_NEEDS_FORCE_PUSH}" == "true" ]]; then
    git push --force origin "refs/tags/${TAG}"
    ok "Force-pushed updated tag ${TAG} to origin"
  else
    git push origin --tags
  fi
  ok "Pushed to origin/${CURRENT_BRANCH} with tag ${TAG}"
fi
echo ""


# ── jsDelivr CDN URLs ─────────────────────────────────────────────────────────
info "jsDelivr CDN URLs for ${PACKAGE_NAME}@${VERSION}:"
echo ""
echo -e "  ${GREEN}GitHub (pinned to ${TAG})${NC}"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/index.js"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/esm/index.js"
echo "    https://cdn.jsdelivr.net/gh/${GH_REPO}@${TAG}/dist/index.d.ts"
echo ""

ok "Deployment of ${TAG} complete! 🚀"
echo ""

# ── Step 5/5 — CDN availability check ────────────────────────────────────────
info "Step 5/5 — Checking CDN availability for ${TAG} …"

MAIN_FILE="dist/index.js"
GITHUB_USER="${GH_REPO%%/*}"
GITHUB_REPO_NAME="${GH_REPO##*/}"
CDN_URL="https://cdn.jsdelivr.net/gh/${GH_REPO}@${VERSION}/${MAIN_FILE}"

_cdn_purge() {
  local url="$1"
  local purge_url="${url/cdn.jsdelivr.net/purge.jsdelivr.net}"
  curl -s -o /dev/null --max-time 10 "${purge_url}" || true
}

_github_raw_check() {
  local gh_user="$1" gh_repo="$2" git_tag="$3" rel_path="$4"
  local raw_url="https://raw.githubusercontent.com/${gh_user}/${gh_repo}/${git_tag}/${rel_path}"
  curl -s -f -o /dev/null --max-time 10 "${raw_url}"
}

_cdn_check() {
  local label="$1" url="$2" max_retries=5 interval=30
  _cdn_purge "${url}"
  for ((attempt=1; attempt<=max_retries; attempt++)); do
    if curl -s -f -o /dev/null --max-time 10 "${url}"; then
      ok "${label} is live on jsDelivr ✓"
      echo "    ${url}"
      return 0
    fi
    if [[ ${attempt} -lt ${max_retries} ]]; then
      warn "${label}: not ready yet (attempt ${attempt}/${max_retries}) — retrying in ${interval}s …"
      sleep "${interval}"
    fi
  done
  warn "${label}: not yet available on CDN after ${max_retries} attempts."
  echo "    Check manually: ${url}"
  return 0
}

if command -v curl &>/dev/null; then
  if _github_raw_check "${GITHUB_USER}" "${GITHUB_REPO_NAME}" "${TAG}" "${MAIN_FILE}"; then
    ok "${MAIN_FILE} is committed and visible on GitHub ✓"
  else
    warn "${MAIN_FILE} not found on GitHub — CDN delivery will fail"
  fi
  _cdn_check "${GITHUB_REPO_NAME} ${TAG}" "${CDN_URL}" || true
else
  warn "curl not found — skipping CDN check"
  echo "    Verify manually: ${CDN_URL}"
fi
echo ""
