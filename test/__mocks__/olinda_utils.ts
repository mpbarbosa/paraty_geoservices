// Runtime stub for olinda_utils.js CDN import — used by Jest moduleNameMapper.
export const logger = {
    warn: (msg: string, ...args: unknown[]) => console.warn(new Date().toISOString(), msg, ...args),
    error: (msg: string, ...args: unknown[]) => console.error(new Date().toISOString(), msg, ...args),
    info: (msg: string, ...args: unknown[]) => console.info(new Date().toISOString(), msg, ...args),
};
