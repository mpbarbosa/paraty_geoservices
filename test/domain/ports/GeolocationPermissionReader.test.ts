import type {
  GeolocationPermissionState,
  GeolocationPermissionReader,
} from '../../../src/domain/ports/GeolocationPermissionReader';

class MockPermissionReader implements GeolocationPermissionReader {
  private state: GeolocationPermissionState;
  constructor(state: GeolocationPermissionState) {
    this.state = state;
  }
  async checkPermissions(): Promise<GeolocationPermissionState> {
    return this.state;
  }
}

describe('GeolocationPermissionReader', () => {
  it('should resolve to "granted" when permission is granted', async () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('granted');
    await expect(reader.checkPermissions()).resolves.toBe('granted');
  });

  it('should resolve to "denied" when permission is denied', async () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('denied');
    await expect(reader.checkPermissions()).resolves.toBe('denied');
  });

  it('should resolve to "prompt" when permission is prompt', async () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('prompt');
    await expect(reader.checkPermissions()).resolves.toBe('prompt');
  });

  it('should conform to GeolocationPermissionReader interface', async () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('prompt');
    expect(typeof reader.checkPermissions).toBe('function');
    const result = await reader.checkPermissions();
    expect(['granted', 'denied', 'prompt']).toContain(result);
  });

  it('should handle multiple permission checks returning the same state', async () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('granted');
    expect(await reader.checkPermissions()).toBe('granted');
    expect(await reader.checkPermissions()).toBe('granted');
  });

  it('should return a Promise from checkPermissions', () => {
    const reader: GeolocationPermissionReader = new MockPermissionReader('denied');
    const result = reader.checkPermissions();
    expect(result).toBeInstanceOf(Promise);
  });

  it('should allow each state value to be checked independently', async () => {
    const states: GeolocationPermissionState[] = ['granted', 'denied', 'prompt'];
    for (const state of states) {
      const reader = new MockPermissionReader(state);
      await expect(reader.checkPermissions()).resolves.toBe(state);
    }
  });
});
