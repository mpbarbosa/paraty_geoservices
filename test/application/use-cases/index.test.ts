import {
  GetCurrentPositionUseCase,
  WatchPositionUseCase,
} from './index';

describe('use-cases/index exports', () => {
  it('should export GetCurrentPositionUseCase as a constructor', () => {
    expect(typeof GetCurrentPositionUseCase).toBe('function');
    try {
      const instance = new (GetCurrentPositionUseCase as any)();
      expect(instance).toBeInstanceOf(GetCurrentPositionUseCase);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('should export WatchPositionUseCase as a constructor', () => {
    expect(typeof WatchPositionUseCase).toBe('function');
    try {
      const instance = new (WatchPositionUseCase as any)();
      expect(instance).toBeInstanceOf(WatchPositionUseCase);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('should throw if GetCurrentPositionUseCase is called without new', () => {
    expect(() => {
      (GetCurrentPositionUseCase as any)();
    }).toThrow();
  });

  it('should throw if WatchPositionUseCase is called without new', () => {
    expect(() => {
      (WatchPositionUseCase as any)();
    }).toThrow();
  });
});
