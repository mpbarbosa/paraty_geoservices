# Step 20 Report

**Step:** Async Performance Review
**Status:** ✅
**Timestamp:** 5/15/2026, 9:17:12 AM

---

## Summary

## Async Performance Review

### Heuristic Pre-scan
| Indicator | Count |
| --- | --- |
| Explicit Promise constructors | 1 |
| Potential unhandled rejections (.then without .catch) | 1 |
| Missing event listener cleanup | 0 |
| **Total heuristic signals** | **2** |

### AI Analysis

#### Partition 1 of 4

**Async Performance Review — paraty_geoservices (Partition 1 of 4)**

**Files analyzed:**  
- `src/application/use-cases/GetCurrentPositionUseCase.ts`  
- `src/infrastructure/providers/BrowserGeolocationProvider.ts` (full, both parts)

---

### 1. Overfetching
✅ No issues found.  
No network/data fetches or over-broad queries are present in the provided code.

---

### 2. Promise Overhead
- **File:** `src/application/use-cases/GetCurrentPositionUseCase.ts`
- **Severity:** MEDIUM
- **Dimension:** Promise Anti-Patterns / Overhead
- **Issue:** Explicit `new Promise` wrapping a callback API (lines 30–38). This is necessary for callback-to-promise conversion, but if the provider ever returns a promise, this would be redundant.
- **Fix:**  
  _Before:_
  ```ts
  execute(options?: GeoPositionOptions): Promise<GetCurrentPositionOutput> {
      return new Promise((resolve, reject) => {
          this.provider.getCurrentPosition(
              (pos) => resolve({ position: pos }),
              reject,
              options,
          );
      });
  }
  ```
  _After (if provider is updated to return a promise):_
  ```ts
  async execute(options?: GeoPositionOptions): Promise<GetCurrentPositionOutput> {
      const pos = await this.provider.getCurrentPosition(options);
      return { position: pos };
  }
  ```
  _Current usage is correct for callback APIs, but should be revisited if the provider evolves._

- **Impact:** Slight overhead, but justified for callback-to-promise conversion. No action needed unless provider API changes.

---

### 3. Event Loop Congestion
✅ No issues found.  
No CPU-heavy synchronous work detected in async paths.

---

### 4. Memory Leaks
✅ No issues found.  
No unclosed streams, unremoved listeners, or timer leaks in the provided code.

---

### 5. API Call Batching
✅ No issues found.  
No N+1 fetch or batchable API patterns present.

---

### 6. Debouncing & Throttling
✅ No issues found.  
No event handlers or polling loops requiring debounce/throttle.

---

### 7. Error Handling
- **File:** `src/application/use-cases/GetCurrentPositionUseCase.ts`
- **Severity:** MEDIUM
- **Dimension:** Error Handling
- **Issue:** Errors from the provider are passed to `reject`, but there is no structured error normalization or logging.
- **Fix:**  
  _Before:_
  ```ts
  this.provider.getCurrentPosition(
      (pos) => resolve({ position: pos }),
      reject,
      options,
  );
  ```
  _After (optional improvement):_
  ```ts
  this.provider.getCurrentPosition(
      (pos) => resolve({ position: pos }),
      (err) => {
          // Optionally log or normalize error
          reject(err);
      },
      options,
  );
  ```
- **Impact:** Unstructured errors may propagate; consider normalizing or logging for observability.

---

### 8. Promise Anti-Patterns
- **File:** `src/application/use-cases/GetCurrentPositionUseCase.ts`
- **Severity:** LOW
- **Dimension:** Promise Anti-Patterns
- **Issue:** Use of `new Promise` to wrap a callback is a necessary pattern here, but should be reviewed if the provider API changes to promise-based.
- **Fix:** See Promise Overhead above.
- **Impact:** No immediate risk; just a pattern to monitor.

---

### 9. Resource Cleanup
- **File:** `src/infrastructure/providers/BrowserGeolocationProvider.ts`
- **Severity:** MEDIUM
- **Dimension:** Resource Cleanup
- **Issue:** `watchPosition` returns a watch ID, but there is no guarantee in this code that `clearWatch` is always called by consumers. No `AbortController` or cancellation for long-lived geolocation watches.
- **Fix:**  
  _Before:_ (consumer responsibility)
  ```ts
  const watchId = provider.watchPosition(...);
  // No enforced cleanup
  ```
  _After:_ (document and encourage cleanup)
  ```ts
  // Document: Always call clearWatch(watchId) when done
  ```
  _Or, provide a helper:_
  ```ts
  startWatchPosition(...): { stop: () => void }
  ```
- **Impact:** If consumers forget to call `clearWatch`, geolocation watches may leak, causing battery drain or memory leaks in browser environments.

---

## Prioritized Recommendations

1. **Resource Cleanup:**  
   - Document and enforce that consumers of `watchPosition` must call `clearWatch` to prevent leaks.
   - Consider providing a helper that returns a cleanup function.

2. **Error Handling:**  
   - Optionally normalize or log errors in the use case layer for better observability.

3. **Promise Patterns:**  
   - The explicit `new Promise` is correct for callback APIs, but revisit if the provider API changes to promise-based.

---

## Summary Table

| Dimension             | Issues Found? | Severity  | Notes                                                      |
|-----------------------|---------------|-----------|------------------------------------------------------------|
| Overfetching          | No            | —         |                                                            |
| Promise Overhead      | Minor         | MEDIUM    | Explicit Promise wrapper; justified for callback API        |
| Event Loop Congestion | No            | —         |                                                            |
| Memory Leaks          | No            | —         |                                                            |
| API Call Batching     | No            | —         |                                                            |
| Debounce/Throttle     | No            | —         |                                                            |
| Error Handling        | Minor         | MEDIUM    | Errors passed to reject; consider normalization/logging     |
| Promise Anti-Patterns | Minor         | LOW       | Pattern is correct, but monitor if provider API changes     |
| Resource Cleanup      | Yes           | MEDIUM    | Consumers must call clearWatch; consider helper/warning     |

---

**End of Partition 1/4 Review.**  
(Continue to next partition for further async analysis.)

#### Partition 2 of 4

**Async Performance Review — paraty_geoservices (Partition 2 of 4)**

**Files analyzed:**  
- `src/application/services/GeolocationService.ts` (parts 1 & 2 of 3; partial file)

---

### 1. Overfetching
✅ No issues found.  
No network/data fetches or over-broad queries are present in the visible code.

---

### 2. Promise Overhead
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** LOW
- **Dimension:** Promise Overhead
- **Issue:** The use of `new Promise` in `getSingleLocationUpdate` (lines 51–108) is necessary for callback-to-promise conversion, but if the provider ever returns a promise, this would be redundant.
- **Fix:**  
  _Before:_
  ```ts
  this.pendingPromise = new Promise<GeoPosition>((resolve, reject) => {
      // callback-based provider usage
  });
  ```
  _After (if provider is updated to return a promise):_
  ```ts
  this.pendingPromise = this.provider.getCurrentPosition(options);
  ```
- **Impact:** Slight overhead, but justified for callback APIs. No action needed unless provider API changes.

---

### 3. Event Loop Congestion
✅ No issues found.  
No CPU-heavy synchronous work detected in async paths.

---

### 4. Memory Leaks
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** MEDIUM
- **Dimension:** Memory Leaks
- **Issue:** The `watchId` is set and used for geolocation watches, but in the visible code, there is no guarantee that `clearWatch` is always called when stopping or destroying the service (full cleanup logic not visible in this partition).
- **Fix:**  
  _Before:_ (potentially missing cleanup)
  ```ts
  // watchId is set, but no visible cleanup
  ```
  _After:_ (ensure cleanup in service teardown)
  ```ts
  if (this.watchId !== null) {
      this.provider.clearWatch(this.watchId);
      this.watchId = null;
  }
  ```
- **Impact:** If `clearWatch` is not called, geolocation watches may leak, causing battery drain or memory leaks in browser environments.

---

### 5. API Call Batching
✅ No issues found.  
No N+1 fetch or batchable API patterns present.

---

### 6. Debouncing & Throttling
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** LOW
- **Dimension:** Debouncing & Throttling
- **Issue:** Throttling is correctly implemented for watch callbacks using a `throttle` utility (lines 6, 80). No issues found; this is a positive pattern.
- **Fix:** _No action needed._
- **Impact:** Prevents excessive callback firing, improving performance and UX.

---

### 7. Error Handling
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** MEDIUM
- **Dimension:** Error Handling
- **Issue:** Errors are handled and normalized in `getSingleLocationUpdate`, but there is no logging or structured error reporting for unexpected errors (e.g., fallback errors).
- **Fix:**  
  _Before:_
  ```ts
  reject(err);
  ```
  _After (optional improvement):_
  ```ts
  // Optionally log or normalize error
  reject(err);
  ```
- **Impact:** Unstructured errors may propagate; consider normalizing or logging for observability.

---

### 8. Promise Anti-Patterns
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** LOW
- **Dimension:** Promise Anti-Patterns
- **Issue:** Use of `new Promise` to wrap a callback is a necessary pattern here, but should be reviewed if the provider API changes to promise-based.
- **Fix:** See Promise Overhead above.
- **Impact:** No immediate risk; just a pattern to monitor.

---

### 9. Resource Cleanup
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** MEDIUM
- **Dimension:** Resource Cleanup
- **Issue:** No visible guarantee that `clearWatch` is called when the service is stopped or destroyed (full lifecycle not visible in this partition).
- **Fix:**  
  _Before:_ (potentially missing cleanup)
  ```ts
  // watchId is set, but no visible cleanup
  ```
  _After:_ (ensure cleanup in service teardown)
  ```ts
  if (this.watchId !== null) {
      this.provider.clearWatch(this.watchId);
      this.watchId = null;
  }
  ```
- **Impact:** If consumers forget to call `clearWatch`, geolocation watches may leak, causing battery drain or memory leaks in browser environments.

---

## Prioritized Recommendations

1. **Resource Cleanup & Memory Leaks:**  
   - Ensure `clearWatch` is always called when stopping or destroying the service.
   - Document and enforce cleanup in the service lifecycle.

2. **Error Handling:**  
   - Optionally normalize or log errors in the service layer for better observability.

3. **Promise Patterns:**  
   - The explicit `new Promise` is correct for callback APIs, but revisit if the provider API changes to promise-based.

---

## Summary Table

| Dimension             | Issues Found? | Severity  | Notes                                                      |
|-----------------------|---------------|-----------|------------------------------------------------------------|
| Overfetching          | No            | —         |                                                            |
| Promise Overhead      | Minor         | LOW       | Explicit Promise wrapper; justified for callback API        |
| Event Loop Congestion | No            | —         |                                                            |
| Memory Leaks          | Yes           | MEDIUM    | Ensure clearWatch is always called                         |
| API Call Batching     | No            | —         |                                                            |
| Debounce/Throttle     | Positive      | LOW       | Throttling implemented correctly                           |
| Error Handling        | Minor         | MEDIUM    | Errors handled, but consider normalization/logging          |
| Promise Anti-Patterns | Minor         | LOW       | Pattern is correct, but monitor if provider API changes     |
| Resource Cleanup      | Yes           | MEDIUM    | Ensure clearWatch is always called                         |

---

**End of Partition 2/4 Review.**  
(Continue to next partition for further async analysis.)

#### Partition 3 of 4

**Async Performance Review — paraty_geoservices (Partition 3 of 4)**

**Files analyzed:**  
- `src/application/services/GeolocationService.ts` (part 3/3)  
- `src/infrastructure/providers/MockGeolocationProvider.ts` (part 1/2; partial file)

---

### 1. Overfetching
✅ No issues found.  
No network/data fetches or over-broad queries are present in the visible code.

---

### 2. Promise Overhead
✅ No issues found.  
No unnecessary sequential awaits, redundant `async` functions, or mixed `.then()`/`await` patterns in the visible code.

---

### 3. Event Loop Congestion
✅ No issues found.  
No CPU-heavy synchronous work detected in async paths.

---

### 4. Memory Leaks
- **File:** `src/infrastructure/providers/MockGeolocationProvider.ts`
- **Severity:** MEDIUM
- **Dimension:** Memory Leaks
- **Issue:** `pendingTimeouts` is a `Set` of scheduled timeouts, but there is no visible cleanup (e.g., `clearTimeout` or removal from the set) when a watch is cleared or the provider is disposed. This could accumulate references if not managed in the unseen code.
- **Fix:**  
  _Before:_
  ```ts
  private readonly pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
  // No visible cleanup on clearWatch or provider teardown
  ```
  _After:_
  ```ts
  clearWatch(watchId: number): void {
      this.activeWatches.delete(watchId);
      // Also clear any pending timeouts associated with this watch
      for (const timeout of this.pendingTimeouts) {
          clearTimeout(timeout);
          this.pendingTimeouts.delete(timeout);
      }
  }
  ```
- **Impact:** Unmanaged timeouts may retain memory and cause test flakiness or leaks in long-lived test runs.

---

### 5. API Call Batching
✅ No issues found.  
No N+1 fetch or batchable API patterns present.

---

### 6. Debouncing & Throttling
- **File:** `src/application/services/GeolocationService.ts`
- **Severity:** LOW
- **Dimension:** Debouncing & Throttling
- **Issue:** Throttling is correctly implemented for watch callbacks using a `throttle` utility. No issues found; this is a positive pattern.
- **Fix:** _No action needed._
- **Impact:** Prevents excessive callback firing, improving performance and UX.

---

### 7. Error Handling
- **File:** `src/infrastructure/providers/MockGeolocationProvider.ts`
- **Severity:** LOW
- **Dimension:** Error Handling
- **Issue:** Errors are surfaced via callbacks, but there is no logging or normalization. This is acceptable for a mock/test provider.
- **Fix:** _No action needed for test/mock code._
- **Impact:** No production risk; only relevant if mock is used in production.

---

### 8. Promise Anti-Patterns
✅ No issues found.  
No explicit Promise constructor wrapping async code, deferred patterns, or redundant wrapping in the visible code.

---

### 9. Resource Cleanup
- **File:** `src/infrastructure/providers/MockGeolocationProvider.ts`
- **Severity:** MEDIUM
- **Dimension:** Resource Cleanup
- **Issue:** As above, `pendingTimeouts` may not be cleared on `clearWatch` or provider teardown, risking resource leaks in long-lived test runs.
- **Fix:** See Memory Leaks above.
- **Impact:** Unmanaged timeouts may retain memory and cause test flakiness or leaks in long-lived test runs.

---

## Prioritized Recommendations

1. **Resource Cleanup & Memory Leaks:**  
   - Ensure all scheduled timeouts in `pendingTimeouts` are cleared and removed when a watch is cleared or the provider is disposed.

2. **Debounce/Throttle:**  
   - Throttling is implemented correctly; no action needed.

3. **Error Handling:**  
   - No action needed for mock/test code, but ensure production code normalizes/logs errors.

---

## Summary Table

| Dimension             | Issues Found? | Severity  | Notes                                                      |
|-----------------------|---------------|-----------|------------------------------------------------------------|
| Overfetching          | No            | —         |                                                            |
| Promise Overhead      | No            | —         |                                                            |
| Event Loop Congestion | No            | —         |                                                            |
| Memory Leaks          | Yes           | MEDIUM    | Ensure pendingTimeouts are cleared on watch/provider cleanup|
| API Call Batching     | No            | —         |                                                            |
| Debounce/Throttle     | Positive      | LOW       | Throttling implemented correctly                           |
| Error Handling        | Minor         | LOW       | Acceptable for mock; ensure production code is robust       |
| Promise Anti-Patterns | No            | —         |                                                            |
| Resource Cleanup      | Yes           | MEDIUM    | Ensure pendingTimeouts are cleared on watch/provider cleanup|

---

**End of Partition 3/4 Review.**  
(Continue to next partition for further async analysis.)

#### Partition 4 of 4

**Async Performance Review — paraty_geoservices (Partition 4 of 4)**

**Files analyzed:**  
- `src/infrastructure/providers/MockGeolocationProvider.ts` (part 2/2)  
- `src/infrastructure/providers/AwsGeocoder.ts`  
- `src/domain/ports/ReverseGeocoder.ts`  
- `src/domain/ports/GeolocationPermissionReader.ts`  

---

### 1. Overfetching
- **File:** `src/infrastructure/providers/AwsGeocoder.ts`
- **Severity:** LOW
- **Dimension:** Overfetching
- **Issue:** The AWS reverse geocoding endpoint returns a full response envelope, but only the address is used. No field selection or projection is applied at the HTTP layer.
- **Fix:**  
  _Before:_
  ```ts
  const response = await fetch(this.endpoint, { ... });
  const rawData = (await response.json()) as AwsReverseGeocodeResponse;
  return toGeoAddress(rawData);
  ```
  _After:_  
  (If the API supports field selection, add query params or request body fields to limit the response. If not, document the limitation.)
- **Impact:** Slightly higher network and parsing cost; not critical unless response is large or called at high volume.

---

### 2. Promise Overhead
✅ No issues found.  
No unnecessary sequential awaits, redundant `async` functions, or mixed `.then()`/`await` patterns.

---

### 3. Event Loop Congestion
✅ No issues found.  
No CPU-heavy synchronous work detected in async paths.

---

### 4. Memory Leaks
✅ No issues found.  
`MockGeolocationProvider.destroy()` clears all watches and timeouts.

---

### 5. API Call Batching
✅ No issues found.  
No N+1 fetch or batchable API patterns present.

---

### 6. Debouncing & Throttling
✅ No issues found.  
No event handlers or polling loops requiring debounce/throttle.

---

### 7. Error Handling
- **File:** `src/infrastructure/providers/AwsGeocoder.ts`
- **Severity:** MEDIUM
- **Dimension:** Error Handling
- **Issue:** Unhandled network or JSON parsing errors in `reverseGeocode` (lines 101–124). Only HTTP status is checked; network errors or invalid JSON will throw unhandled.
- **Fix:**  
  _Before:_
  ```ts
  const response = await fetch(this.endpoint, { ... });
  if (!response.ok) throw new Error(...);
  const rawData = (await response.json()) as AwsReverseGeocodeResponse;
  return toGeoAddress(rawData);
  ```
  _After:_
  ```ts
  try {
    const response = await fetch(this.endpoint, { ... });
    if (!response.ok) throw new Error(...);
    const rawData = (await response.json()) as AwsReverseGeocodeResponse;
    return toGeoAddress(rawData);
  } catch (err) {
    throw new Error(`(AwsGeocoder) Network or parse error: ${err instanceof Error ? err.message : String(err)}`);
  }
  ```
- **Impact:** Unhandled rejections may crash the process or cause silent failures.

---

### 8. Promise Anti-Patterns
✅ No issues found.  
No explicit Promise constructor wrapping async code, deferred patterns, or redundant wrapping.

---

### 9. Resource Cleanup
- **File:** `src/infrastructure/providers/AwsGeocoder.ts`
- **Severity:** MEDIUM
- **Dimension:** Resource Cleanup
- **Issue:** No `AbortController` is used for the fetch in `reverseGeocode`, so requests cannot be cancelled if the caller aborts.
- **Fix:**  
  _Before:_
  ```ts
  const response = await fetch(this.endpoint, { ... });
  ```
  _After:_
  ```ts
  const controller = new AbortController();
  // Pass controller.signal to fetch and expose controller to caller for cancellation
  const response = await fetch(this.endpoint, { ..., signal: controller.signal });
  ```
- **Impact:** Inability to cancel in-flight requests may waste resources or delay shutdown.

---

## Prioritized Recommendations

1. **Error Handling:**  
   - Wrap the entire `reverseGeocode` method in a `try/catch` to handle network and JSON parsing errors, and provide structured error messages.

2. **Resource Cleanup:**  
   - Add `AbortController` support to `reverseGeocode` to allow request cancellation.

3. **Overfetching:**  
   - If the AWS API supports field selection, use it to minimize response size.

---

## Summary Table

| Dimension             | Issues Found? | Severity  | Notes                                                      |
|-----------------------|---------------|-----------|------------------------------------------------------------|
| Overfetching          | Minor         | LOW       | No field selection; not critical unless response is large   |
| Promise Overhead      | No            | —         |                                                            |
| Event Loop Congestion | No            | —         |                                                            |
| Memory Leaks          | No            | —         | destroy() cleans up watches/timeouts in mock                |
| API Call Batching     | No            | —         |                                                            |
| Debounce/Throttle     | No            | —         |                                                            |
| Error Handling        | Yes           | MEDIUM    | Unhandled network/parse errors in reverseGeocode            |
| Promise Anti-Patterns | No            | —         |                                                            |
| Resource Cleanup      | Yes           | MEDIUM    | No AbortController for fetch in reverseGeocode              |

---

**End of Partition 4/4 Review.**  
(Async performance review complete for all provided files.)

## Details

No details available

---

Generated by AI Workflow Automation
