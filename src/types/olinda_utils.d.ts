// Minimal type stub for olinda_utils.js CDN package.
// Used as a fallback when the sibling repo is not present (e.g. Docker / CI).
export declare const logger: {
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
};
