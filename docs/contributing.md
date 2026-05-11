# Contributing

## Development Setup

```bash
git clone https://github.com/mpbarbosa/paraty_geoservices.git
cd paraty_geoservices
npm install
```

---

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run all unit tests with Jest |
| `npm run test:coverage` | Run tests and produce an HTML coverage report |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run docs` | Generate TypeDoc API reference into `docs/api/` |

---

## Project Structure

```
src/
├── domain/
│   ├── entities/          Pure TypeScript interfaces (no dependencies)
│   └── ports/             Abstract GeolocationProvider base class
├── application/
│   ├── dtos/              Use-case output shapes
│   └── use-cases/         GetCurrentPositionUseCase, WatchPositionUseCase
├── infrastructure/
│   └── providers/         BrowserGeolocationProvider (browser adapter)
└── index.ts               Public barrel — re-exports everything
docs/
├── api/                   Auto-generated TypeDoc HTML (do not edit manually)
├── architecture.md        Layer diagram and data-flow descriptions
├── getting-started.md     Installation and usage guide
└── contributing.md        This file
```

See [`architecture.md`](./architecture.md) for a full explanation of each layer.

---

## Adding a New Provider

1. Create `src/infrastructure/providers/<Name>Provider.ts`.
2. Extend `GeolocationProvider` from `src/domain/ports/GeolocationProvider`.
3. Implement `getCurrentPosition`, `watchPosition`, `clearWatch`, and `isSupported`.
4. Re-export from `src/infrastructure/providers/index.ts` and `src/infrastructure/index.ts`.
5. Add corresponding tests in `src/infrastructure/providers/<Name>Provider.test.ts`.

---

## Coding Standards

- **TypeScript strict mode** is enforced (`"strict": true` in `tsconfig.json`).
- All public APIs must have JSDoc comments.
- Keep layers pure: domain must not import from application or infrastructure; application must not import from infrastructure.
- Test coverage is expected for all new code. Run `npm run test:coverage` to check.

---

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] New code has unit tests
- [ ] Docs updated if public API changed (`npm run docs`)
- [ ] No cross-layer imports violating the dependency rule
- [ ] Commit messages are descriptive and follow conventional format
