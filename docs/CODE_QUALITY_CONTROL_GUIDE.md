# Code Quality Control Guide

**Document version:** `1.0.0`

This guide defines quality-control expectations for implementation changes in
`paraty_geoservices`, with focus on boundary-heavy integration code such as
geolocation adapters, reverse-geocoding wrappers, and provider SDK boundaries.

It is intentionally narrow: use it to review the quality of implementation
changes, not as a replacement for the architecture and design guides.

## Source of truth

Use this guide together with:

- [Clean Architecture Guide](./CLEAN_ARCHITECTURE_GUIDE.md)
- [High Cohesion Guide](./HIGH_COHESION_GUIDE.md)
- [Low Coupling Guide](./LOW_COUPLING_GUIDE.md)
- [Referential Transparency Guide](./REFERENTIAL_TRANSPARENCY.md)

## Goal

Catch quality regressions early by checking that new code:

1. lands in the correct layer (`src/domain/`, `src/application/`, or `src/infrastructure/`)
2. keeps public APIs clear and intentional
3. isolates provider SDK and HTTP details at adapter boundaries
4. preserves deterministic domain and helper logic where practical
5. stays covered by repository validation and focused tests

## Quality gates

Every substantive code change should satisfy these gates.

### 1. Responsibility gate

- A file, class, or document should keep one clear primary job.
- Adapter modules such as `AwsGeocoder` or `NominatimAdapter` should wrap
  transport behavior, not become generic buckets for parsing, address mapping,
  coordinate validation, and retry policy at once.
- If a component description needs repeated "and", split or extract.

See [High Cohesion Guide](./HIGH_COHESION_GUIDE.md) for the full reference.

### 2. Boundary gate

- Public APIs should expose library-owned concepts such as `GeoAddress`,
  `GeoPosition`, and `GeolocationProvider` by default.
- Provider-specific response shapes must not cross into public APIs unless the
  leak is explicit, justified, and documented.
- HTTP client details, retry logic, SDK quirks, and dynamic imports should stay
  in narrow internal adapters inside `src/infrastructure/`.

See [Low Coupling Guide](./LOW_COUPLING_GUIDE.md) for the full reference.

### 3. Domain-alignment gate

- Use the project's established ubiquitous language consistently across all
  modules and documents: `GeoAddress`, `GeoPosition`, `GeolocationProvider`,
  `CoordinateValidator`, `ReverseGeocoder`.
- Prefer value-style modeling for coordinates, addresses, configs, and parsed
  outputs.
- Avoid adding abstractions whose main effect is ceremony rather than clarity.

### 4. Purity gate

- Keep pure mapping, parsing, normalization, and validation logic — such as
  `normaliseOsmAddress` or `CoordinateValidator` — in small reusable helpers
  where practical.
- Keep HTTP requests, caching, environment access, and provider session work in
  explicit infrastructure modules.
- Do not hide side effects behind utility-sounding names.

See [Referential Transparency Guide](./REFERENTIAL_TRANSPARENCY.md) for the
full reference.

### 5. Test gate

- Changes to public behavior require focused tests at the affected boundary.
- Extracted helper logic should gain direct unit coverage when its behavior is
  significant enough to regress independently.
- Split tests along responsibility seams when a refactor separates domain rules
  from transport or mapping logic.

### 6. Documentation gate

- Update user-facing docs when public API behavior, exports, or recommended
  usage changes.
- Cross-link to related design guides instead of restating them.
- Call out intentional breaking cleanup in `CHANGELOG.md`.

### 7. Architecture gate

See [Clean Architecture Guide](./CLEAN_ARCHITECTURE_GUIDE.md) for the full
layer reference. The key checks at review time:

- Dependencies must point inward. No inner-layer file (`src/domain/`,
  `src/application/`) may import from an outer layer (`src/infrastructure/`).
- Domain and application files must be free of HTTP clients, browser APIs,
  `fetch`, `navigator`, and AWS SDK imports.
- Use cases must receive providers via constructor injection using the
  `GeolocationProvider` port — never construct a concrete adapter internally.
- Adapter translation code must stay in `src/infrastructure/`; it must not
  leak into domain types or application use-case files.
- Infrastructure wiring (HTTP clients, provider construction, DI) belongs in
  `src/infrastructure/` or the composition root only.
- Domain and use-case logic must be exercisable in tests using
  `MockGeolocationProvider` with no real network, browser, or device.

### 8. Validation gate

Run the repository validation commands for substantive code changes:

1. Test: `npm test`
2. Build: `npm run build`

## Review checklist

- [ ] The change belongs to the correct layer (`src/domain/`, `src/application/`, or `src/infrastructure/`).
- [ ] Public names reflect library concepts (`GeoAddress`, `GeoPosition`) rather than provider-specific shapes.
- [ ] HTTP, SDK, and provider-specific details are isolated in `src/infrastructure/` adapters.
- [ ] Pure helpers (address normalization, coordinate validation) are separated from runtime orchestration.
- [ ] New abstractions improve clarity more than they increase indirection.
- [ ] Tests cover the changed boundary and any newly extracted critical helper.
- [ ] Docs and changelog reflect any meaningful API or behavior change.
- [ ] Repository validation commands still pass (`npm test`, `npm run build`).
- [ ] No `src/domain/` or `src/application/` file imports from `src/infrastructure/`.
- [ ] Domain and application files have no `fetch`, `navigator`, `process.env`, or SDK imports.
- [ ] Use cases receive `GeolocationProvider` via constructor injection, not by constructing a concrete adapter.
- [ ] Adapter translation code does not leak into domain types or application use-case logic.
- [ ] Infrastructure wiring is confined to `src/infrastructure/` or the composition root.

## Summary

Good quality control is mostly about keeping boundaries clear, abstractions
small, and public APIs intentional. Favor thinner adapters, focused helpers,
and explicit documentation over broad wrappers and hidden dependency leakage.
