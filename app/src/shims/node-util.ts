// Shim browser-safe de node:util.
export const promisify = <T extends (...args: never[]) => unknown>(fn: T): T => fn;
export default { promisify };
