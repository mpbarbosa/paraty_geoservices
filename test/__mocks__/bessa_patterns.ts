// Runtime stub for bessa_patterns.ts CDN import — used by Jest moduleNameMapper.
export class DualObserverSubject {
    observers: Array<{ update: (...args: unknown[]) => void }> | null = [];
    functionObservers: Array<(...args: unknown[]) => void> = [];
}
