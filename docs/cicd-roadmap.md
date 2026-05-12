# CI/CD Roadmap

This document describes the recommended CI/CD pipeline for `paraty_geoservices`, ordered by priority. Each phase is self-contained and can be shipped independently.

---

## Current State

| Concern | Status |
|---|---|
| Unit tests | Manual — `npm test` |
| Coverage reporting | Manual — `npm run test:coverage` |
| Build verification | Manual — `npm run build` |
| Docs generation | Manual — `npm run docs` |
| Automated pipeline | **None** |
| npm publish | **Manual** |

---

## Phase 1 — Continuous Integration (Priority: High)

**Goal:** Every push and every pull request is automatically validated.

### What to automate

- `npm ci` (reproducible install from lock file)
- `npm run build` (TypeScript compilation, both CJS and ESM outputs)
- `npm test` (73+ unit tests via Jest)

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

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

### Why a Node matrix?

`getting-started.md` declares Node ≥ 18 as the minimum requirement. Testing on 18, 20, and 22 confirms the library works across the supported LTS range without requiring extra effort per run — GitHub Actions parallelises the matrix automatically.

### Effort: Low (2–3 hours)

---

## Phase 2 — Coverage Gates (Priority: Medium)

**Goal:** Prevent untested code from reaching `main`.

`jest.config.ts` already has `collectCoverageFrom` configured for `src/**/*.ts`. The only missing piece is a threshold and a CI step that runs `npm run test:coverage`.

### Changes required

**`jest.config.ts`** — add a `coverageThreshold` block:

```typescript
const config: Config = {
  // ... existing keys ...
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
};
```

Start conservatively (80/70) and raise thresholds as coverage improves. The current suite (73 tests, clean pass) should already exceed these values.

**`.github/workflows/ci.yml`** — replace the `Test` step:

```yaml
      - name: Test with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-node-${{ matrix.node-version }}
          path: coverage/
          retention-days: 7
```

Uploading the artifact preserves the HTML report for inspection on every run without requiring a third-party service.

### Optional: Codecov / Coveralls integration

If public visibility of coverage trends is desired, add after the upload step:

```yaml
      - name: Publish to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
```

### Effort: Low (1–2 hours)

---

## Phase 3 — Automated Release Pipeline (Priority: Medium)

**Goal:** A tagged release on GitHub triggers a build, test, and npm publish — no manual steps.

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

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### Release procedure (after this workflow is in place)

1. Update `CHANGELOG.md` — move items from `[Unreleased]` to the new version section.
2. Bump version in `package.json` (`npm version patch|minor|major`).
3. Push the version commit: `git push origin main`.
4. Push the tag: `git push origin v<version>` — this triggers the release workflow.

### Required secret

Add `NPM_TOKEN` to the repository's **Settings → Secrets and variables → Actions**. Generate the token from npmjs.com under **Access Tokens → Automation**.

### Effort: Medium (3–4 hours, including npm token setup)

---

## Phase 4 — Documentation Publishing (Priority: Low)

**Goal:** The TypeDoc API reference at `docs/api/` is regenerated and deployed automatically on every release.

### Workflow addition — append a `docs` job to `release.yml`

```yaml
  docs:
    needs: release
    runs-on: ubuntu-latest

    permissions:
      contents: write
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

      - name: Deploy to GitHub Pages
        id: deploy
        uses: actions/deploy-pages@v4
        with:
          source: docs/api/
```

Enable GitHub Pages in **Settings → Pages → Source: GitHub Actions** before the first deploy.

### Effort: Low (1–2 hours)

---

## Phase 5 — Dependency and Security Auditing (Priority: Low)

**Goal:** Surface vulnerable or outdated dependencies automatically.

### Add to `ci.yml`, inside the `test` job

```yaml
      - name: Audit dependencies
        run: npm audit --audit-level=high
```

`--audit-level=high` fails the build only on high/critical vulnerabilities, avoiding noise from low-severity advisories.

### Optional: Dependabot

Add `.github/dependabot.yml` to receive automated PRs for dependency updates:

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

## Recommended Implementation Order

| Phase | Workflow file | Effort | Unblocks |
|---|---|---|---|
| 1 — CI | `ci.yml` | Low | All subsequent phases |
| 2 — Coverage gates | `ci.yml` update + `jest.config.ts` | Low | Quality enforcement |
| 3 — Release pipeline | `release.yml` | Medium | Automated npm publishes |
| 4 — Docs publishing | `release.yml` update | Low | Public API reference |
| 5 — Security auditing | `ci.yml` update + `dependabot.yml` | Low | Dependency hygiene |

Phases 1 and 2 can be shipped in a single PR. Phases 3–5 are independent of each other once Phase 1 is in place.
