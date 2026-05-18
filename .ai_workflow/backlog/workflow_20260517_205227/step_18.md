# Step 18 Report

**Step:** Debugging_Analysis
**Status:** ✅
**Timestamp:** 5/17/2026, 8:58:50 PM

---

## Summary

# Step 18: Debugging Analysis — Async Flow Debugger

## Files Analyzed
- src/application/services/ChangeDetectionCoordinator.ts
- src/application/services/GeolocationService.test.ts
- src/application/services/GeolocationService.ts
- src/application/services/ReverseGeocoder.test.ts
- src/application/services/ReverseGeocoder.ts
- src/application/services/reverseGeocoderEvents.ts
- src/application/use-cases/GetCurrentPositionUseCase.test.ts
- src/application/use-cases/GetCurrentPositionUseCase.ts
- src/application/use-cases/WatchPositionUseCase.test.ts
- src/application/use-cases/WatchPositionUseCase.ts
- src/infrastructure/providers/AwsAddressMapper.ts
- src/infrastructure/providers/AwsGeocoder.ts
- src/infrastructure/providers/BrowserGeolocationProvider.ts
- src/infrastructure/providers/MockGeolocationProvider.ts
- src/infrastructure/providers/MockReverseGeocoder.ts
- src/infrastructure/providers/NominatimAddressMapper.ts
- src/infrastructure/providers/NominatimGeocoder.ts
- src/application/ObserverSubject.test.ts
- src/application/ObserverSubject.ts
- src/domain/ports/GeolocationPermissionReader.ts

## AI Analysis

#### Partition 1 of 16

**Async Flow Analysis**

Patterns Present: none

- No `async` functions, `await` keywords, `.then()`, `.catch()`, or `Promise` usage found.
- No `fetch`, `XMLHttpRequest`, or any HTTP/network calls present.
- All methods are synchronous and callback-based; error handling is via synchronous `try/catch`.

**Execution Chain:**  
Not applicable — no async functions or promise chains found.

**Error Path Diagram:**
```
[handleXChange(event)]
    ↓
[try notifyXChangeObservers(event)]
    ↓
[Success?]
    ↓
┌───┴───┐
↓       ↓
[Yes]   [No]
↓       ↓
[Done]  [logger.error()]
```
- Each change handler wraps observer notification in a `try/catch` and logs errors.

**CORS/Network Validation:**  
Not applicable — no network or fetch code found.

**Timing Analysis:**  
Timing evidence unavailable from static source excerpts; no parallel or async operations present.

**Issue Identified:**  
None found in the provided code. All error handling is synchronous and appears robust for the visible logic.

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. No async or network issues are present in this file partition.

#### Partition 2 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async` test functions (e.g., `it('resolves...', async () => {...})`)
- `await` used for Promise resolution and rejection checks
- No `.then()` or `.catch()` chains (all handled via async/await)
- No `fetch`, `XMLHttpRequest`, or HTTP/network calls present (MockGeolocationProvider is used)

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., resolves with position on success)
2. `await service.getSingleLocationUpdate()` → SUCCESS/FAILED (depending on test setup)
3. [If error expected] `await expect(...).rejects.toMatchObject(...)` - [SUCCESS if error thrown]

---

**Error Path Diagram:**
```
[Call getSingleLocationUpdate()]
    ↓
[await Promise]
    ↓
[Success?]
    ↓
┌───┴───┐
↓       ↓
[Yes]   [No]
↓       ↓
[Check result]  [Check rejection]
```
- Tests verify both successful resolution and rejection paths.

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- Some tests use `jest.useFakeTimers()` and `jest.advanceTimersByTime()` to simulate throttling and timing, but no real timestamps or durations are present in the static code.
- Race-condition protection is explicitly tested: concurrent calls to `getSingleLocationUpdate()` are checked to ensure the same Promise is returned, preventing duplicate in-flight requests.
- No evidence of missing `await` or unhandled Promise rejections in the test code.

---

**Issue Identified:**  
None found in the provided test code. Async flows are properly awaited and error paths are explicitly tested.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test source was analyzed. Async and race-condition behaviors are well-covered by the test logic shown.

#### Partition 3 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async` test functions (e.g., `async () => { ... }`)
- `await` used for Promise resolution in test assertions
- No `.then()` or `.catch()` chains (all handled via async/await)
- No `fetch`, `XMLHttpRequest`, or HTTP/network calls present

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., flushThrottle() allows an immediate second fetch)
2. `await service.getSingleLocationUpdate()` - SUCCESS
3. `jest.advanceTimersByTime(...)` - Simulates time passage
4. `await service.getSingleLocationUpdate()` - SUCCESS

- Similar patterns for watchCurrentLocation and throttle tests, with event simulation and callback assertions.

---

**Error Path Diagram:**
```
[Call async test]
    ↓
[await Promise]
    ↓
[Success?]
    ↓
┌───┴───┐
↓       ↓
[Check result]  [Check rejection]
```
- Error handling is tested by simulating error events and checking callback invocations.

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- Tests use `jest.useFakeTimers()` and `jest.advanceTimersByTime()` to simulate throttling and cooldowns.
- No real timestamps or durations are present; all timing is simulated.
- No evidence of missing `await` or unhandled Promise rejections.
- No race conditions: tests for watch ID reuse, throttle resets, and error swallowing are explicit and deterministic.

---

**Issue Identified:**  
None found in the provided test code. Async flows, throttling, and error paths are explicitly tested and controlled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test source was analyzed. Async, throttle, and error behaviors are well-covered by the test logic shown.

#### Partition 4 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async` test functions (e.g., `async () => { ... }`)
- `await` used for Promise resolution in test assertions and service methods
- No `.then()` or `.catch()` chains (all handled via async/await)
- No `fetch`, `XMLHttpRequest`, or HTTP/network calls present (all network-like behavior is mocked)

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., provider integration)
2. `await service.getSingleLocationUpdate()` - SUCCESS
3. `service.flushThrottle()` - synchronous
4. `service.watchCurrentLocation()` - synchronous
5. `service.stopWatching()` - synchronous

- Similar async/await patterns for permission checks and error handling.

---

**Error Path Diagram:**
```
[Call async test]
    ↓
[await Promise]
    ↓
[Success?]
    ↓
┌───┴───┐
↓       ↓
[Check result]  [Check rejection]
```
- Error handling is tested by simulating error events and checking callback invocations.

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- No real timestamps or durations are present; all timing is simulated or synchronous.
- No evidence of missing `await` or unhandled Promise rejections.
- No race conditions: tests for permission fallback, provider integration, and error swallowing are explicit and deterministic.

---

**Issue Identified:**  
None found in the provided test code or the visible portion of the service constructor. Async flows, permission fallback, and error paths are explicitly tested and controlled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test and partial service source was analyzed. Async, permission, and error behaviors are well-covered by the test logic shown.

#### Partition 5 of 16

**Async Flow Analysis**

Patterns Present: Promise usage

- `Promise` is used for async flows in `getSingleLocationUpdate()` and `checkPermissions()`
- No `async` functions or `await` keywords in this partition (all async via explicit Promise construction)
- No `.then()` or `.catch()` chains (all handled via Promise executor functions)
- No `fetch`, `XMLHttpRequest`, or HTTP/network calls present

---

**Execution Chain (getSingleLocationUpdate):**
1. [Call] getSingleLocationUpdate()
2. [Check] If pending, return existing Promise
3. [Check] If within throttle, return cached position (Promise.resolve)
4. [Check] If provider unsupported, return Promise.reject
5. [Create] New Promise:
   - provider.getCurrentPosition(success, error, options)
   - On success: clear pending, cache, resolve
   - On error: if timeout (code 3) and high accuracy, retry with low accuracy
     - On fallback success: clear pending, cache, resolve
     - On fallback error: clear pending, reject
   - On other error: clear pending, reject

---

**Error Path Diagram:**
```
[getSingleLocationUpdate()]
    ↓
[Pending?]──Yes──→[Return pending Promise]
    ↓ No
[Throttle?]──Yes──→[Return cached Promise]
    ↓ No
[Supported?]──No──→[Promise.reject(NotSupportedError)]
    ↓ Yes
[provider.getCurrentPosition()]
    ↓
[Success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Resolve]   [Timeout?]
                ↓
            [Yes]→[Retry low accuracy]
                ↓
            [No] →[Reject]
```

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- Throttling is enforced via timestamps and intervals, not via async timing primitives.
- No Promise.all or parallel awaits; all async flows are single-Promise or callback-based.
- Timeout handling is explicit: code 3 triggers a retry with lower accuracy.
- No race conditions: concurrent calls return the same pending Promise.

---

**Issue Identified:**  
None found in the provided code. All async flows are guarded, error paths are explicit, and retry/fallback logic is present for timeouts.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static service source was analyzed. Async, error, and retry behaviors are well-covered by the code logic shown.

#### Partition 6 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, network/fetch (mocked)

- `async` test functions (e.g., `test('...', async () => {...})`)
- `await` used for Promise resolution and rejection checks
- Promises returned by geocoder methods
- Mocked `fetch` function used in some tests (simulating network/fetch)
- No `.then()` or `.catch()` chains (all handled via async/await)
- No real `XMLHttpRequest` or HTTP client calls; all network is mocked

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., falls back to AWS when nominatim fails)
2. `await geocoder.fetchAddress()` - SUCCESS/FAILED depending on provider mocks
3. [If error expected] `await expect(...).rejects.toMatchObject(...)` - [SUCCESS if error thrown]

---

**Error Path Diagram:**
```
[fetchAddress()]
    ↓
[Primary provider success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Return]    [Fallback provider?]
                ↓
            [Yes]→[Fallback success?]
                ↓       ↓
            [Yes]   [No]
            [Return][Rethrow original error]
```
- Tests verify fallback and error propagation paths.

---

**CORS/Network Validation:**  
- Mocked `fetch` is used; CORS/network errors are simulated via error objects.
- Fallback logic is explicitly tested: if primary fails, fallback is attempted; if both fail, original error is rethrown.
- No real CORS headers or proxy logic present in this test code.

---

**Timing Analysis:**
- No real timestamps or durations; all async flows are controlled by Promise resolution/rejection.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided test code. Async flows, fallback, and error paths are explicitly tested and controlled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test source was analyzed. Async, fallback, and error behaviors are well-covered by the test logic shown.

#### Partition 7 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, network/fetch (mocked)

- `async` test functions (e.g., `test('...', async () => {...})`)
- `await` used for Promise resolution and rejection checks
- Promises returned by geocoder methods
- Mocked `fetch` function and simulated network errors
- No `.then()` or `.catch()` chains (all handled via async/await)
- No real `XMLHttpRequest` or HTTP client calls; all network is mocked

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., Nominatim HTTP errors via factory)
2. `await geocoder.fetchAddress()` - SUCCESS/FAILED depending on fetch mock
3. [If error expected] `await expect(...).rejects.toMatchObject(...)` - [SUCCESS if error thrown]

---

**Error Path Diagram:**
```
[fetchAddress()]
    ↓
[Primary provider success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Return]    [Fallback provider?]
                ↓
            [Yes]→[Fallback success?]
                ↓       ↓
            [Yes]   [No]
            [Return][Rethrow original error]
```
- Tests verify fallback, error propagation, and observer notification paths.

---

**CORS/Network Validation:**  
- Mocked `fetch` is used; CORS/network errors are simulated via error objects.
- Error notifier is called on CORS-like failures and HTTP 429.
- Fallback logic and error propagation are explicitly tested.

---

**Timing Analysis:**
- No real timestamps or durations; all async flows are controlled by Promise resolution/rejection.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided test code. Async flows, fallback, error, and notification paths are explicitly tested and controlled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test source was analyzed. Async, fallback, error, and notification behaviors are well-covered by the test logic shown.

#### Partition 8 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, network/fetch (mocked)

- `async` test functions (e.g., `test('...', async () => {...})`)
- `await` used for Promise resolution and rejection checks
- Promises returned by geocoder methods
- Mocked `fetch` function and simulated network errors
- No `.then()` or `.catch()` chains (all handled via async/await)
- No real `XMLHttpRequest` or HTTP client calls; all network is mocked

---

**Execution Chain Example (from test cases):**
1. [Start] async test function (e.g., error notifier on CORS-like failures)
2. `await geocoder.fetchAddress()` - SUCCESS/FAILED depending on fetch mock/error
3. [If error expected] `await expect(...).rejects.toBeDefined()` - [SUCCESS if error thrown]
4. [Observers and notifiers are checked for correct invocation]

---

**Error Path Diagram:**
```
[fetchAddress()]
    ↓
[Primary provider success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Return]    [Fallback provider?]
                ↓
            [Yes]→[Fallback success?]
                ↓       ↓
            [Yes]   [No]
            [Return][Rethrow original error]
```
- Tests verify fallback, error propagation, observer notification, and browser event dispatch.

---

**CORS/Network Validation:**  
- Mocked `fetch` is used; CORS/network errors are simulated via error objects.
- Error notifier is called on CORS-like failures and HTTP 429/425.
- Fallback logic and error propagation are explicitly tested.

---

**Timing Analysis:**
- No real timestamps or durations; all async flows are controlled by Promise resolution/rejection.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided test code or the visible portion of the service class. Async flows, fallback, error, notification, and event dispatch paths are explicitly tested and controlled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test and partial service source was analyzed. Async, fallback, error, notification, and event behaviors are well-covered by the test logic shown.

#### Partition 9 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, promise chains, network/fetch (via provider adapters)

- `async` methods: `fetchAddress`, `completeWithAddress`, `reverseGeocode`
- `await` used for provider calls and error handling
- `.then()` and `.catch()` used in `update()` for async side-effects
- No direct `fetch`/`XMLHttpRequest` in this file, but provider adapters may use them
- Error handling with try/catch and fallback logic

---

**Execution Chain (fetchAddress):**
1. [Start] async fetchAddress()
2. If AWS is primary, try AWS provider: `await this._aws.reverseGeocode(...)`
   - On success: `completeWithAddress` → SUCCESS
   - On error: log, fall back to Nominatim
3. Try Nominatim: `await this._nominatim.reverseGeocode(...)`
   - On success: `completeWithAddress` → SUCCESS
   - On error: if AWS fallback available, try AWS again
     - On AWS fallback error: log, call handleFetchError, throw original error

---

**Error Path Diagram:**
```
[fetchAddress()]
    ↓
[Primary provider success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Return]    [Fallback provider?]
                ↓
            [Yes]→[Fallback success?]
                ↓       ↓
            [Yes]   [No]
            [Return][handleFetchError→throw]
```
- `handleFetchError` notifies observers and user, logs error, and sets error state.

---

**CORS/Network Validation:**  
- CORS/network errors are detected by message matching in `handleFetchError`.
- User is notified via `errorNotifier` for CORS, HTTP 429, and HTTP 425.
- Fallback logic is present for provider failures.

---

**Timing Analysis:**
- No explicit timestamps or durations; all async flows are controlled by Promise resolution/rejection.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided code. Async flows, fallback, error, and notification paths are explicitly handled and robust.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static service source was analyzed. Async, fallback, error, and notification behaviors are well-covered by the code logic shown.

#### Partition 10 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async` test functions in the test file
- `await` used for Promise resolution and rejection checks in tests
- `Promise` usage in `GetCurrentPositionUseCase.execute()`
- No `.then()` or `.catch()` chains (all handled via async/await)
- No `fetch`, `XMLHttpRequest`, or HTTP client calls present

---

**Execution Chain (GetCurrentPositionUseCase):**
1. [Start] async test function (e.g., resolves with acquired position)
2. `await useCase.execute()` - SUCCESS/FAILED depending on provider mock
3. [If error expected] `await expect(...).rejects.toEqual(...)` - [SUCCESS if error thrown]

---

**Error Path Diagram:**
```
[execute()]
    ↓
[Provider getCurrentPosition]
    ↓
[Success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[resolve]   [reject]
```
- Errors from the provider are directly propagated via Promise rejection.

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- No real timestamps or durations; all async flows are controlled by Promise resolution/rejection.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided code. Async flows and error paths are explicitly handled and tested.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test and use case source was analyzed. Async and error behaviors are well-covered by the code logic shown.

#### Partition 11 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async` test functions in the test file
- `await` used for Promise resolution and rejection checks in tests
- No `Promise` usage in the use case itself (all callback-based, synchronous interface)
- No `.then()` or `.catch()` chains
- No `fetch`, `XMLHttpRequest`, or HTTP client calls present

---

**Execution Chain:**  
Not applicable — no async functions or promise chains in the use case itself; all async/await is in test code for test orchestration.

---

**Error Path Diagram:**
```
[start()]
    ↓
[watchId already set?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[stop()]   [watchPosition()]
    ↓           ↓
[watchPosition()]
```
- Errors from the provider are handled via the `onError` callback, not via Promise rejection.

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**
- No real timestamps or durations; all async flows are controlled by callback invocation.
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided code. Callback flows and error paths are explicitly handled and tested.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static test and use case source was analyzed. Callback and error behaviors are well-covered by the code logic shown.

#### Partition 12 of 16

**Async Flow Analysis**

Patterns Present: none

- No `async` functions, `await`, `.then()`, `.catch()`, or `Promise` usage found.
- No `fetch`, `XMLHttpRequest`, or HTTP client calls present.
- All functions are synchronous, pure data mappers and string utilities.

---

**Execution Chain:**  
Not applicable — no async functions or promise chains found.

---

**Error Path Diagram:**  
Not applicable — no try/catch, error propagation, or async error boundaries present.

---

**CORS/Network Validation:**  
Not applicable — no network or fetch code found.

---

**Timing Analysis:**  
Timing evidence unavailable from static source excerpts; all code is synchronous and stateless.

---

**Issue Identified:**  
None found in the provided code. All logic is synchronous and side-effect-free.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. No async or network issues are present in this file.

#### Partition 13 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, network/fetch

- `async` function: `AwsGeocoder.reverseGeocode`
- `await` used for `fetch` and `response.json()` in `AwsGeocoder.reverseGeocode`
- `Promise` returned by `reverseGeocode`
- No `.then()` or `.catch()` chains (all handled via async/await)
- Direct `fetch` HTTP call (network scope)
- `BrowserGeolocationProvider` is callback-based, no async/await or Promise usage in the visible part

---

**Execution Chain (AwsGeocoder.reverseGeocode):**
1. [Start] async reverseGeocode()
2. `await fetch(endpoint, { ... })` - SUCCESS/FAILED
   - On network error: throw custom error
3. `if (!response.ok)` - throw custom error
4. `await response.json()` - parse result
5. `toGeoAddress(rawData)` - return mapped address

---

**Error Path Diagram:**
```
[reverseGeocode()]
    ↓
[fetch()]
    ↓
[Success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[response.ok?] [throw network error]
    ↓       ↓
[Yes]   [No]
↓           ↓
[parse JSON][throw HTTP error]
    ↓
[toGeoAddress()]
    ↓
[Return]
```

---

**CORS/Network Validation:**  
- Network errors and HTTP status errors are caught and wrapped in custom errors.
- No explicit retry or fallback logic for CORS/network failures in this provider.

---

**Timing Analysis:**
- No explicit timing or timeout handling in the visible code (relies on fetch's default).
- No evidence of race conditions or missing awaits.

---

**Issue Identified:**  
None found in the provided code. Async flows and error paths are explicitly handled for network errors, but no retry/fallback for CORS/network failures.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. Async, error, and network behaviors are well-covered for the visible logic.

#### Partition 14 of 16

**Async Flow Analysis**

Patterns Present: Promise usage, .then(), callback-based async, setTimeout (simulated async)

- `Promise` returned by `checkPermissions()` in both providers
- `.then()` used in `BrowserGeolocationProvider.checkPermissions()` for Permissions API
- No `async`/`await` functions (all Promises are constructed or returned directly)
- No `fetch`/network calls

---

**Execution Chain:**

_BrowserGeolocationProvider.checkPermissions():_
1. [Start] checkPermissions()
2. If Permissions API supported: `activeNavigator.permissions.query({ name: 'geolocation' })`
   - `.then(result => result.state, () => 'prompt')`
3. If not supported: `Promise.resolve('prompt')`

_MockGeolocationProvider.checkPermissions():_
1. [Start] checkPermissions()
2. `Promise.resolve(this.config.permissionState)`

_MockGeolocationProvider.getCurrentPosition()/watchPosition():_
- Schedules callback via setTimeout (simulated async), invokes success/error callback based on config

---

**Error Path Diagram:**
```
[checkPermissions()]
    ↓
[Permissions API?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[query().then()] [Promise.resolve('prompt')]
    ↓
[result.state or 'prompt']
```

---

**CORS/Network Validation:**  
Not applicable — no fetch/HTTP/network code found.

---

**Timing Analysis:**  
- Async simulated via setTimeout in MockGeolocationProvider (delay configurable)
- No real concurrency/race conditions; all async is deterministic and testable
- Timing evidence unavailable from static source excerpts

---

**Issue Identified:**  
None found. Async flows are explicit, deterministic, and error paths are handled.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. All async and error flows are robust and test-friendly.

#### Partition 15 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage, network/fetch

- `async` functions: `MockReverseGeocoder.reverseGeocode`, `NominatimGeocoder.reverseGeocode`, `NominatimGeocoder.fetchAndMap`, `NominatimGeocoder.fetchRaw`
- `await` used for fetch, fetchFn, and JSON parsing
- Promises returned by all reverseGeocode methods
- Network/fetch calls in `NominatimGeocoder.fetchRaw`
- No `.then()`/`.catch()` chains (all handled via async/await)

---

**Execution Chain (NominatimGeocoder.reverseGeocode):**
1. [Start] async reverseGeocode()
2. Validate coordinates
3. `await fetchAndMap()` - [SUCCESS/FAILED]
   - On error: if shouldRetryWithCorsProxy, call retryWithCorsProxy()
   - Else, throw error
4. fetchAndMap: build URL → `await fetchRaw(url)` → `await response.json()` → map to GeoAddress

---

**Error Path Diagram:**
```
[reverseGeocode()]
    ↓
[fetchAndMap()]
    ↓
[fetchRaw()]
    ↓
[fetchFn(url)]
    ↓
[Success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[response.ok?] [throw network error]
    ↓       ↓
[Yes]   [No]
↓           ↓
[parse JSON][throw HTTP error]
    ↓
[toGeoAddressFromNominatim()]
    ↓
[Return]
    ↓
[Catch?]
    ↓
[shouldRetryWithCorsProxy?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[retryWithCorsProxy()] [throw error]
```

---

**CORS/Network Validation:**  
- CORS/network errors are detected and can trigger a retry with a CORS proxy if enabled.
- Fallback logic is present for CORS/network failures.
- Errors are wrapped in custom error types and propagated.

---

**Timing Analysis:**  
- No explicit timeout handling; relies on fetch defaults.
- No evidence of race conditions or missing awaits.
- Timing evidence unavailable from static source excerpts.

---

**Issue Identified:**  
None found. Async, error, and CORS fallback flows are robust and explicit.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. All async, error, and CORS/network fallback flows are present and testable.

#### Partition 16 of 16

**Async Flow Analysis**

Patterns Present: async/await, Promise usage

- `async`/`Promise` usage in `NominatimGeocoder.retryWithCorsProxy` and `GeolocationPermissionReader.checkPermissions` (interface)
- No `.then()`/`.catch()` chains in these excerpts
- No `fetch`/network calls in this partition (network logic is in part 1, already analyzed)
- ObserverSubject and its test are synchronous (no async/await, Promise, or network)

---

**Execution Chain (NominatimGeocoder.retryWithCorsProxy):**
1. [Start] async retryWithCorsProxy()
2. Set CORS proxy, mark retry
3. `await fetchAndMap()` - [SUCCESS/FAILED]
4. Restore proxy, reset retry flag

---

**Error Path Diagram:**
```
[retryWithCorsProxy()]
    ↓
[fetchAndMap()]
    ↓
[Success?]
    ↓       ↓
[Yes]   [No]
↓           ↓
[Return] [throw error]
```

---

**CORS/Network Validation:**  
Not applicable in this partition (network/fetch logic is in part 1).

---

**Timing Analysis:**  
No explicit timing or concurrency; all async flows are sequential and stateful.  
Timing evidence unavailable from static source excerpts.

---

**Issue Identified:**  
None found. Async flows and error handling are explicit and robust.

---

**Validation:**  
Runtime timing validation is unavailable from this request; only static source was analyzed. All async and error flows are present and testable.


## Details

No details available

---

Generated by AI Workflow Automation
