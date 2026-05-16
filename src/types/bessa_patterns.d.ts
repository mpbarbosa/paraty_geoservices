// Minimal type stub for bessa_patterns.ts CDN package.
// Used as a fallback when the sibling repo is not present (e.g. Docker / CI).
export declare class DualObserverSubject {
    observers: Array<{ update: (...args: unknown[]) => void }> | null;
    functionObservers: Array<(...args: unknown[]) => void>;
}
