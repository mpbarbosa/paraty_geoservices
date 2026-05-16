/**
 * Port interface for reading geolocation permission state.
 *
 * Keeps browser-specific permission checks out of the application layer while
 * allowing infrastructure adapters to surface permission status when the
 * underlying runtime supports it.
 *
 * @module domain/ports/GeolocationPermissionReader
 * @since 1.4.0
 * @author Marcelo Pereira Barbosa
 */
/**
 * Supported permission states for geolocation access.
 */
export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt';
/**
 * Port for collaborators that can report the current geolocation permission
 * state.
 *
 * @example
 * class BrowserGeolocationProvider implements GeolocationPermissionReader {
 *   async checkPermissions(): Promise<GeolocationPermissionState> {
 *     return 'prompt';
 *   }
 * }
 */
export interface GeolocationPermissionReader {
    /**
     * Resolves the current permission state for geolocation access.
     *
     * Implementations should return `'prompt'` when the runtime cannot report a
     * more specific state.
     */
    checkPermissions(): Promise<GeolocationPermissionState>;
}
//# sourceMappingURL=GeolocationPermissionReader.d.ts.map