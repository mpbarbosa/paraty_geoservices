# ChangeDetectionCoordinator Test Documentation

## Overview

`ChangeDetectionCoordinator` is the application-layer service that wires
address-component change callbacks to observer notification. The current
behavior is verified by the focused unit suite at
`test/application/services/ChangeDetectionCoordinator.test.ts`.

## Test file

`test/application/services/ChangeDetectionCoordinator.test.ts`

## What the suite covers

The suite validates 35 focused behaviors grouped around the coordinator's real
public contract:

1. **Construction and injected collaborators**
   - stores `addressState`, `observerSubject`, and `logger`
   - initializes `currentPosition` to `null`
   - accepts any `IObserverSubject` implementation
2. **Position management**
   - stores a `GeoPosition`
   - clears the cached position with `null`
3. **Change-detection lifecycle**
   - registers street, neighborhood, and city callbacks
   - removes callbacks individually or all at once
   - warns through the injected logger when no extractor is configured
4. **Change-event handling**
   - `handleStreetChange`, `handleNeighborhoodChange`, and `handleCityChange`
     do not throw on valid events
   - errors raised during notification are logged and isolated
5. **Observer notification contract**
   - object observers receive `StreetChanged`, `NeighborhoodChanged`, and
     `CityChanged` with `event.to`
   - function observers receive `GeoPosition | null`, the current
     `GeoAddress | null`, and the typed event
   - null observer lists are treated as empty
   - throwing function observers do not prevent later observers from running
   - neighborhood and city notifications emit info logs
6. **Extractor integration**
   - extractor callbacks dispatch to the matching handler methods
   - callback removal sets extractor callbacks back to `null`
7. **Typed event contract**
   - `AddressFieldChangeEvent` carries `from`, `to`, `previousAddress`, and
     `currentAddress`
   - all event fields may be `null`
8. **Separation of concerns**
   - the coordinator can be instantiated without runtime/browser dependencies
   - multiple coordinator instances do not share observer state

## Key fixtures used by the tests

- `ADDRESS_A` and `ADDRESS_B`: representative `GeoAddress` values for typed
  event assertions
- `MOCK_POSITION`: a representative `GeoPosition` forwarded to function
  observers
- `MockObserverSubject`: a narrow in-memory `IObserverSubject` test double
- `mockExtractor`: an `IAddressComponentExtractor` stub that captures
  registered callbacks
- `makeLogger()`: mocked `warn`, `error`, and `info` methods for behavioral
  assertions

## Running the suite

```bash
npx jest test/application/services/ChangeDetectionCoordinator.test.ts
```

## Why this doc matters

This document is intentionally aligned to the current TypeScript unit suite
rather than an older browser-driven scenario. Use the test file above as the
source of truth for expected coordinator behavior, event shapes, and observer
semantics.
