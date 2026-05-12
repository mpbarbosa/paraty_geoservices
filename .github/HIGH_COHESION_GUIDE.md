# High Cohesion Guide

High cohesion is a core design rule for `paraty_geoservices`.

## Goal

Each module, class, function, and script should have one clear responsibility.
Related behaviour should stay together. Unrelated behaviour should be split into
separate units with explicit boundaries.

## What High Cohesion Means

A cohesive component is easy to describe in one sentence:

- "This module resolves coordinates to administrative boundaries."
- "This adapter fetches geodata from the Nominatim API."
- "This function normalises a raw OSM address into a GeoAddress."

If the best description needs repeated "and", the responsibility is probably too
broad.

## Architecture Layers

`paraty_geoservices` is organised into three layers. Keep each component inside
the narrowest layer that matches its real job:

| Layer | Responsibility |
| --- | --- |
| `src/domain/` | Business rules, value objects, and invariants for reverse geocoding |
| `src/application/` | Use-case orchestration; depends on domain and infrastructure interfaces |
| `src/infrastructure/` | External I/O: HTTP clients, caches, geolocation providers |

Do not mix layer responsibilities inside one module. Domain logic must not reach
into infrastructure; infrastructure adapters must not contain business rules.

## Required Rules

1. A file should centre on one primary concern.
2. A function should do one job and expose one clear reason to change.
3. Parsing, validation, orchestration, persistence, formatting, and domain logic
   must not be mixed unless a file exists specifically to compose them.
4. Utility modules must not become dumping grounds for unrelated helpers.
5. Shared abstractions should be introduced only when responsibilities are
   genuinely shared, not just similar by name.
6. Entry points may compose multiple concerns, but reusable code beneath them
   should remain narrowly focused.

## Positive Signals

- File names match the responsibility they implement.
- Public APIs are small and intention-revealing.
- Helper functions directly support the file's main concern.
- A module's tests cluster around one behaviour area.
- Changes to one behaviour rarely require edits to distant, unrelated files.

## Warning Signs

- One file edits config, performs HTTP requests, formats output, and contains
  domain rules.
- A function both decides geocoding policy and manages transport retry logic.
- `utils`, `helpers`, or `manager` modules accumulate unrelated responsibilities.
- A file needs large section comments to justify why unrelated logic lives
  together.
- Naming becomes generic because the component does too many things.

## Review Heuristics

### One-Sentence Test

Can the component's purpose be described in one clear sentence without "and",
"also", or "plus"?

### Change-Impact Test

If one behaviour changes, do unrelated parts need to change too? If yes, cohesion
is probably weak.

### Naming Test

If the best name is vague, the responsibility likely is too.

### Split Test

If the component can be split into two focused parts without awkward surgery, it
may already contain multiple responsibilities.

## Summary Checklist

- [ ] The file has one primary concern.
- [ ] The name matches the responsibility.
- [ ] Helpers support the same concern as the parent module.
- [ ] Side effects are separated from domain rules where practical.
- [ ] The component passes the one-sentence test.
- [ ] The component is in the correct architecture layer.
- [ ] A reviewer could infer the component's purpose from its local context.

## See Also

- [LOW_COUPLING_GUIDE.md](LOW_COUPLING_GUIDE.md)
- [copilot-instructions.md](copilot-instructions.md)
