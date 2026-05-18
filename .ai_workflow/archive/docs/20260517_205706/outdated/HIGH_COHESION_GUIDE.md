# High Cohesion Guide

**Document version:** `1.0.0`

High cohesion is a core design rule for `paraty_geoservices`.

This repository already separates concerns across stable layers:

- `src/domain/` for business rules, value objects, and invariants
- `src/application/` for use-case orchestration
- `src/infrastructure/` for external I/O: HTTP clients, caches, and geolocation providers

This guide explains how to keep that structure clear as the library grows.

## Goal

Each module, class, function, and document should have one clear
responsibility. Related behaviour should stay together. Unrelated behaviour
should be split into separate units with explicit boundaries.

## What High Cohesion Means

High cohesion means the parts inside a component naturally belong together and
support the same purpose.

A cohesive component is easy to describe in one sentence:

- "`ReverseGeocoder` resolves coordinates to administrative boundaries."
- "`NominatimAdapter` fetches geodata from the Nominatim HTTP API."
- "`normaliseOsmAddress` converts a raw OSM address into a `GeoAddress`."
- "`CoordinateValidator` checks whether a lat/lon pair falls within valid ranges."

If the best description needs repeated "and", the responsibility is probably
too broad.

## Why It Matters

1. It makes components easier to understand.
2. It keeps changes localized.
3. It improves reuse because responsibilities are explicit.
4. It makes testing and review simpler.
5. It reduces accidental coupling between unrelated concerns.

## High Cohesion and Code LLMs

High cohesion also improves the quality of LLM-assisted coding.

Code-focused models work best when the intent of a file, function, or document
is easy to infer from local context. In this repository, that means a model can
quickly see whether a change belongs in a pure domain rule, an infrastructure
adapter, or an application-layer orchestrator.

This does not replace normal engineering discipline. It means high cohesion is
useful twice: it helps humans reason about the system, and it helps code models
operate on the system more safely.

### Why LLMs Benefit

- Focused modules make intent clearer.
- Clear boundaries reduce hidden dependencies.
- Grouped related logic improves context retrieval.
- Localized responsibilities make refactoring safer.
- Single-purpose APIs make incorrect assumptions less likely.

### Where Low Cohesion Hurts LLMs

- Mixed responsibilities blur the real purpose of the code.
- Generic helper files encourage broad, imprecise edits.
- One change can affect several unrelated behaviors at once.
- The model may miss side effects because they are scattered across concerns.

## Required Rules

1. A file should centre on one primary concern.
2. A function should do one job and expose one clear reason to change.
3. Parsing, validation, orchestration, persistence, formatting, and domain logic
   must not be mixed unless a file exists specifically to compose them.
4. Domain logic in `src/domain/` must not reach into infrastructure or trigger
   I/O.
5. Infrastructure adapters in `src/infrastructure/` must not contain business
   rules.
6. `src/application/` may depend on domain and infrastructure interfaces, but
   must not contain infrastructure implementation details.
7. Utility modules must not become dumping grounds for unrelated helpers.
8. Documents should cover one topic and link to related guides instead of
   duplicating them.

## Positive Signals

- File names match the responsibility they implement.
- Public APIs are small and intention-revealing.
- Helper functions directly support the file's main concern.
- A module's tests cluster around one behaviour area.
- A document can be scanned quickly without shifting between unrelated topics.
- Changes to one behaviour rarely require edits to distant, unrelated files.

## Warning Signs

- One file edits config, performs HTTP requests, formats output, and contains
  domain rules.
- A function both decides geocoding policy and manages transport retry logic.
- `utils`, `helpers`, or `manager` modules accumulate unrelated
  responsibilities.
- A document mixes tutorial, reference, architecture, troubleshooting, and
  release notes in one place.
- Naming becomes generic because the component does too many things.

## Applying Cohesion in This Repository

| Component type | Cohesive responsibility in this project |
| --- | --- |
| `src/domain/` module | One business rule, value object, or invariant for reverse geocoding |
| `src/application/` use case | One orchestration flow that depends on domain and infrastructure interfaces |
| `src/infrastructure/` adapter | One external I/O concern such as HTTP transport, caching, or provider mapping |
| Utility or helper module | One pure, deterministic transformation with no runtime lifecycle concerns |
| Test file | One behaviour area or one module surface |
| Documentation file | One concept, workflow, or reference topic |

Keep new code and new documents in the narrowest layer that matches their real
job.

## Best Practices

### When Creating a New File

1. Define the single purpose before naming it.
2. Place pure domain rules in `src/domain/` with no I/O dependencies.
3. Place infrastructure details in `src/infrastructure/` with no domain logic.
4. Keep orchestration and use-case composition in `src/application/`.
5. Prefer specific names over generic containers such as `helpers` or
   `manager`.

### When Creating Functions or Classes

1. Make inputs and outputs reflect one responsibility.
2. Separate policy decisions from transport or I/O details.
3. Avoid methods that fetch data, validate it, transform it, and format it in
   one pass.
4. Split behaviour when callers need unrelated subsets of the API.
5. Prefer boundaries that let both humans and tools understand the purpose of a
   component from nearby context.

### When Writing Documentation

1. Keep one topic per document.
2. Use cross-references instead of repeating the same guidance across files.
3. Separate how-to guides, reference material, architecture notes, and
   checklists when they grow independently.
4. Name documents so readers can predict their contents without opening them.

## Refactoring for Higher Cohesion

When a component grows unclear or difficult to name, refactor around distinct
responsibilities.

1. List everything the component currently does.
2. Group behaviour by the data it owns or the decision it makes.
3. Split unrelated groups into narrowly named modules or documents.
4. Leave composition in entry points and keep reusable rules in focused units.
5. Rename files and symbols so the single responsibility is obvious.
6. Re-check that each extracted piece can be described in one sentence.

## Review Heuristics

### One-Sentence Test

Can the component's purpose be described in one clear sentence without "and",
"also", or "plus"?

### Change-Impact Test

If one behaviour changes, do unrelated parts need to change too? If yes,
cohesion is probably weak.

This matters even more in LLM-assisted work: low-impact, localized edits are
safer for automated or semi-automated code changes.

### Naming Test

If the best name is vague, the responsibility likely is too.

### Split Test

If the component can be split into two focused parts without awkward surgery, it
may already contain multiple responsibilities.

## Preferred Fixes

1. Extract unrelated responsibilities into narrowly named modules.
2. Keep composition in entry points and domain rules in reusable library code.
3. Move formatting, transport, caching, and orchestration into their own layers.
4. Replace generic helper buckets with purpose-specific modules.
5. Split broad documents into focused guides with clear cross-links.

## Summary Checklist

- [ ] The file or document has one primary concern.
- [ ] The name matches the responsibility.
- [ ] Helpers support the same concern as the parent component.
- [ ] Side effects are separated from domain rules where practical.
- [ ] Unrelated behaviours are not hidden behind a generic API.
- [ ] The component passes the one-sentence test.
- [ ] The component is in the correct architecture layer.
- [ ] The topic would still make sense if read in isolation.
- [ ] A reviewer or code-focused LLM could infer the component's purpose from
      its local context.

## See Also

- [LOW_COUPLING_GUIDE.md](LOW_COUPLING_GUIDE.md)
- [contributing.md](contributing.md)
