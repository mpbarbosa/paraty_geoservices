# Documentation

This folder contains all project documentation.

| File / Folder | Description |
|---|---|
| [`architecture.md`](./architecture.md) | Clean Architecture overview and layer responsibilities |
| [`getting-started.md`](./getting-started.md) | Installation, quick-start guide, and common patterns |
| [`contributing.md`](./contributing.md) | Development setup, coding standards, and PR workflow |
| [`cicd-roadmap.md`](./cicd-roadmap.md) | CI/CD phases, shipped automation milestones, and release/docs publishing flow |
| [`CLEAN_ARCHITECTURE_GUIDE.md`](./CLEAN_ARCHITECTURE_GUIDE.md) | Architecture boundary rules and dependency-direction guidance |
| [`CODE_QUALITY_CONTROL_GUIDE.md`](./CODE_QUALITY_CONTROL_GUIDE.md) | Review checklist for code quality, boundaries, and validation expectations |
| [`HIGH_COHESION_GUIDE.md`](./HIGH_COHESION_GUIDE.md) | Design rules for keeping modules focused and single-purpose |
| [`LOW_COUPLING_GUIDE.md`](./LOW_COUPLING_GUIDE.md) | Design rules for keeping dependencies explicit and narrow |
| [`REFERENTIAL_TRANSPARENCY.md`](./REFERENTIAL_TRANSPARENCY.md) | Design rules for deterministic, side-effect-free logic |
| [`UNIT_TEST_GUIDE.md`](./UNIT_TEST_GUIDE.md) | Unit-testing rules for fast, deterministic, architecture-aligned tests |
| [`AwsGeocoder-code-quality-assessment.md`](./AwsGeocoder-code-quality-assessment.md) | Assessment and remediation summary for the AWS reverse-geocoding adapter |
| [`ChangeDetectionCoordinator.README.md`](./ChangeDetectionCoordinator.README.md) | Test-backed overview of ChangeDetectionCoordinator responsibilities and coverage |
| [`ChangeDetectionCoordinator-code-quality-assessment.md`](./ChangeDetectionCoordinator-code-quality-assessment.md) | Assessment and remediation summary for ChangeDetectionCoordinator |
| [`GeolocationService-code-quality-assessment.md`](./GeolocationService-code-quality-assessment.md) | Assessment and remediation summary for GeolocationService |
| [`api/`](./api/index.html) | Auto-generated TypeDoc API reference — open `api/index.html` in a browser |

## Regenerating the API reference

```bash
npm run docs
```

The HTML output is written to `docs/api/`.
