# paraty_geoservices — Project Roadmap

## Open Issues

### CDN ESM entry-point not intercepted by guia_js Vite plugin

**Discovered:** 2026-05-16  
**Severity:** High — breaks E2E geolocation tests in Docker when CDN hasn't propagated a new tag yet  
**Context:** guia_js (`vite.config.js`) includes a `resolveParatyGeoservicesCDN` Vite plugin that
intercepts `dist/index.js` at build time and replaces it with the local sibling-repo source so that
providers are bundled inline (no runtime CDN fetch).  
However, `dist/esm/index.js` was **not** intercepted. Provider re-export files in guia_js
(`BrowserGeolocationProvider.ts`, `GeolocationProvider.ts`, `MockGeolocationProvider.ts`) all import
from `dist/esm/index.js`. When a new tag (e.g. `v1.6.0`) is pushed and CDN hasn't cached the new
`dist/esm/index.js` yet, Chromium in the E2E Docker container receives 404s for those imports, causing
`WebGeocodingManager` construction to fail silently (error boundary catches it), and all geolocation
E2E tests to time out.

**Workaround applied in guia_js:** Added `dist/esm/index.js` to the list of intercepted CDN URLs
in the `resolveParatyGeoservicesCDN` plugin so the ESM entry point is also bundled from the local
sibling source.

**Progress (2026-05-16):** Implemented roadmap step 3 in `paraty_geoservices` by adding a package-root
`"module"` field and `"exports"` map in `package.json`. npm and bundler consumers can now resolve the
library through the package root instead of pinning `dist/index.js` or `dist/esm/index.js` directly.
This reduces coupling to raw build paths, but it does **not** fully eliminate the CDN propagation risk
for direct `dist/esm/index.js` fetches.

**Recommended fix in paraty_geoservices:**  
Pick **one** of:
1. Ensure the `dist/esm/index.js` file is committed and available on GitHub **before** pushing a
    release tag, so CDN can cache it immediately.
2. Publish a proper npm package so that guia_js can install it as a node_modules dependency and the
    Vite build can resolve it without CDN entirely.
3. **Done (2026-05-16):** Add a `package.json` `"exports"` field with `"."` pointing to both CJS and
    ESM builds so package consumers resolve the correct entry point from the package root.
