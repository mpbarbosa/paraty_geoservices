# CI/CD Roadmap

This document describes the recommended CI/CD pipeline for `paraty_geoservices`, ordered by priority. Each phase is self-contained and can be shipped independently.

---

## Current State

| Concern | Status |
|---|---|
| Unit tests | Manual — `npm test` |
| Coverage reporting | **Phase 2 complete** — `npm run test:coverage` in CI with uploaded `.ai_workflow/coverage/` artifact |
| Build verification | Manual — `npm run build` |
| Docs generation | **Phase 4 complete** — release workflow regenerates TypeDoc and publishes `docs/api/` to GitHub Pages |
| Automated pipeline | **Phase 1 complete** — `.github/workflows/ci.yml` |
| npm publish | **Phase 3 complete** — `.github/workflows/release.yml` on version tags |
| Dependency auditing | **Phase 5 complete** — CI runs `npm audit --audit-level=high` and Dependabot opens weekly npm update PRs |
| Public API surface | **Phase 6 complete** — `ChangeDetectionCoordinator` and its types are exported from the layer barrels and package root |
| Packaged consumer verification | **Phase 7 complete** — `npm run verify:package` installs the packed tarball into isolated CJS, ESM, and TypeScript consumers |

---

## Phase 1 — Continuous Integration ✓ (shipped 2026-05-15)

**Goal:** Every push and every pull request is automatically validated.

### What to automate

- `npm ci` (reproducible install from lock file)
- `tsc --noEmit` (type-check without emitting output — fast, catches type errors before the full build)
- `npm run build` (TypeScript compilation, both CJS and ESM outputs)
- `npm run docs` (TypeDoc build integrity — fails if exported types are malformed)
- `npm test` (163+ unit tests via Jest)
- `npm pack --dry-run` (verify the published file list matches `package.json` `main` and `types` before any release)

### Suggested workflow — `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build

      - name: Check docs build
        run: npm run docs

      - name: Test with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-node-${{ matrix.node-version }}
          path: .ai_workflow/coverage/
          retention-days: 7

      - name: Audit dependencies
        run: npm audit --audit-level=high

      - name: Verify publish file list
        run: npm pack --dry-run

      - name: Verify packaged consumers
        run: npm run verify:package
```

### Why `npx tsc` instead of `tsc`?

The project pins TypeScript 6.x in `devDependencies`. A bare `tsc` call resolves to whatever binary is first on the runner's PATH, which may be a different (older) version installed globally or by a sibling project. `npx tsc` always resolves to the version installed by `npm ci`, keeping CI and local builds consistent.

### Why a Node matrix?

`getting-started.md` declares Node ≥ 18 as the minimum requirement. Testing on 18, 20, and 22 confirms the library works across the supported LTS range without requiring extra effort per run — GitHub Actions parallelises the matrix automatically.

### Effort: Low (2–3 hours)

---

## Phase 2 — Coverage Gates ✓ (shipped 2026-05-16)

**Goal:** Prevent untested code from reaching `main`.

This phase is now shipped. CI runs `npm run test:coverage`, uploads the `.ai_workflow/coverage/` artifact, and enforces an initial baseline-safe global threshold.

### Changes required

**`jest.config.js`** — current global threshold:

```typescript
module.exports = {
  // ... existing keys ...
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  coverageThreshold: {
    global: {
      lines: 97,
      functions: 97,
      branches: 91,
      statements: 97,
    },
  },
};
```

The threshold was set from the measured baseline and rounded down to stable whole numbers so CI passes immediately while still gating regressions. Raise the thresholds incrementally as new tests land.

**`.github/workflows/ci.yml`** — replace the `Test` step:

```yaml
      - name: Test with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-node-${{ matrix.node-version }}
          path: .ai_workflow/coverage/
          retention-days: 7
```

Uploading the artifact preserves the HTML report for inspection on every run without requiring a third-party service.

### Optional: Codecov / Coveralls integration

If public visibility of coverage trends is desired, add after the upload step:

```yaml
      - name: Publish to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: .ai_workflow/coverage/lcov.info
```

### Effort: Low (1–2 hours)

---

## Phase 3 — Automated Release Pipeline ✓ (shipped 2026-05-16)

**Goal:** A tagged release on GitHub triggers a build, test, and npm publish — no manual steps.

This phase is now shipped. Pushing a `v*.*.*` tag runs a release workflow that type-checks, builds, tests, verifies the publish artefact, publishes to npm, and creates a GitHub Release.

### Workflow — `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest

    permissions:
      contents: write   # needed to create the GitHub Release

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          registry-url: https://registry.npmjs.org

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Verify publish file list
        run: npm pack --dry-run

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### Release procedure

1. Update `CHANGELOG.md` — move items from `[Unreleased]` to the new version section.
2. Bump version in `package.json` (`npm version patch|minor|major`).
3. Push the version commit: `git push origin main`.
4. Push the tag: `git push origin v<version>` — this triggers the release workflow.

### Required secret

Add `NPM_TOKEN` to the repository's **Settings → Secrets and variables → Actions**. Generate the token from npmjs.com under **Access Tokens → Automation**.

### Effort: Medium (3–4 hours, including npm token setup)

---

## Phase 4 — Documentation Publishing ✓ (shipped 2026-05-16)

**Goal:** The TypeDoc API reference at `docs/api/` is regenerated and deployed automatically on every release.

This phase is now shipped. After a tagged release succeeds, the same workflow generates the TypeDoc site, uploads `docs/api/` as a Pages artifact, and deploys it to GitHub Pages.

### Workflow addition — append a `docs` job to `release.yml`

```yaml
  docs:
    needs: release
    runs-on: ubuntu-latest

    permissions:
      contents: read
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Generate TypeDoc
        run: npm run docs

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/api

      - name: Deploy to GitHub Pages
        id: deploy
        uses: actions/deploy-pages@v4
```

Enable GitHub Pages in **Settings → Pages → Source: GitHub Actions** before the first deploy.

### Effort: Low (1–2 hours)

---

## Phase 5 — Dependency and Security Auditing ✓ (shipped 2026-05-16)

**Goal:** Surface vulnerable or outdated dependencies automatically.

This phase is now shipped. CI runs `npm audit --audit-level=high` on every
push and pull request, and Dependabot is configured to open weekly npm update
PRs from `.github/dependabot.yml`.

### Implemented CI step

```yaml
      - name: Audit dependencies
        run: npm audit --audit-level=high
```

`--audit-level=high` fails the build only on high/critical vulnerabilities, avoiding noise from low-severity advisories.

### Implemented Dependabot configuration

`.github/dependabot.yml` now enables weekly npm dependency update PRs:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Effort: Low (30 minutes)

---

## Phase 6 — Public API Surface Hardening ✓ (shipped 2026-05-16)

**Goal:** Ensure reusable application-layer services can be consumed through the package's stable public entrypoint instead of internal deep paths.

This phase is now shipped. `ChangeDetectionCoordinator` and its public support
types are re-exported from `src/application/services/index.ts`,
`src/application/index.ts`, and the package root `src/index.ts`, with tests and
documentation covering package-root imports.

During downstream integration work in `guia_js`, one gap surfaced clearly: `ChangeDetectionCoordinator` is implemented and built in `paraty_geoservices`, but it is not exported from `src/index.ts`. That forces consumers to rely on internal build paths such as `dist/esm/application/services/ChangeDetectionCoordinator.js`, which are not part of the documented API contract and may not be available through CDN delivery for a given tag.

### Implemented changes

**`src/index.ts`**, **`src/application/index.ts`**, and
**`src/application/services/index.ts`** now export the coordinator and its
public types:

```typescript
export { ChangeDetectionCoordinator } from './application/services/ChangeDetectionCoordinator';
export type {
  AddressFieldChangeEvent,
  AddressChangeType,
  IAddressChangeObserver,
  IObserverSubject,
  IAddressComponentExtractor,
  IAddressState,
  ILogger,
} from './application/services/ChangeDetectionCoordinator';
```

**Packaging / release verification**

After adding the export:

1. Run `npm run build` to regenerate both CJS and ESM outputs.
2. Run `npm test` to confirm no internal import assumptions broke.
3. Run `npm pack --dry-run` to verify the generated entrypoints and type declarations are included in the package.
4. Validate the release artefact through the package entrypoint rather than a deep file path.

### Why this matters

- Gives downstream apps a stable, documented import path.
- Prevents coupling to internal `dist/esm/...` layout details.
- Makes CDN and package-consumer integration more reliable.
- Keeps the public API aligned with functionality the project already ships.

### Effort: Low (1–2 hours)

---

## Phase 7 — Packaged Consumer Verification ✓ (shipped 2026-05-17)

**Goal:** Prove that the published package works for real consumers through the package root, not just inside the repository checkout.

This phase is now shipped. CI and release validation run `npm run verify:package`, which packs the repository tarball, installs it into isolated CommonJS, ESM, and TypeScript consumer projects under the system temp directory, and asserts named package-root imports resolve correctly.

### Implemented changes

- Added `scripts/verify-package-consumers.mjs` to exercise the packed artefact from isolated temporary consumers outside the repository tree, preventing accidental resolution from the repo's own `node_modules`.
- Added `scripts/prepare-esm-package.mjs` and updated the ESM build to rewrite relative imports with `.js` extensions and emit `dist/esm/package.json` with `"type": "module"` so Node can load the packaged ESM entrypoint.
- Added `prepack` and `verify:package` package scripts so local and CI validation follow the same package-consumer path.
- Wired `npm run verify:package` into `.github/workflows/ci.yml` and `.github/workflows/release.yml` after `npm pack --dry-run`.

### Why this matters

- Catches broken `"exports"` / `"module"` wiring before publish.
- Verifies that the tarball works for CommonJS, ESM, and TypeScript consumers rather than only from source checkout.
- Prevents false positives caused by in-repo module resolution.
- Closes the remaining validation gap behind the package-root entrypoint work from Phase 6.

### Effort: Low (1–2 hours)

---

## Recommended Implementation Order

| Phase | Workflow file | Effort | Unblocks |
|---|---|---|---|
| 1 — CI | `ci.yml` | Low | All subsequent phases |
| 2 — Coverage gates | `ci.yml` update + `jest.config.js` | Low | Quality enforcement |
| 3 — Release pipeline | `release.yml` | Medium | Automated npm publishes |
| 4 — Docs publishing | `release.yml` update | Shipped | Public API reference |
| 5 — Security auditing | Shipped | Low | Dependency hygiene |
| 6 — Public API surface hardening | Shipped | Low | Stable downstream consumption |
| 7 — Packaged consumer verification | `ci.yml`, `release.yml`, package scripts | Shipped | Verified package-root consumption |

Phases 1 and 2 can be shipped in a single PR. Phases 3–6 are independent of each other once Phase 1 is in place.
