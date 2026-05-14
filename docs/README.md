# Documentation

This folder contains all project documentation.

| File / Folder | Description |
|---|---|
| [`architecture.md`](./architecture.md) | Clean Architecture overview and layer responsibilities |
| [`getting-started.md`](./getting-started.md) | Installation, quick-start guide, and common patterns |
| [`contributing.md`](./contributing.md) | Development setup, coding standards, and PR workflow |
| [`HIGH_COHESION_GUIDE.md`](./HIGH_COHESION_GUIDE.md) | Design rules for keeping modules focused and single-purpose |
| [`LOW_COUPLING_GUIDE.md`](./LOW_COUPLING_GUIDE.md) | Design rules for keeping dependencies explicit and narrow |
| [`REFERENTIAL_TRANSPARENCY.md`](./REFERENTIAL_TRANSPARENCY.md) | Design rules for deterministic, side-effect-free logic |
| [`api/`](./api/index.html) | Auto-generated TypeDoc API reference — open `api/index.html` in a browser |

## Regenerating the API reference

```bash
npm run docs
```

The HTML output is written to `docs/api/`.
