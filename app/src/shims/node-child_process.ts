// Shim browser-safe de node:child_process.
const unavailable = (): never => {
  throw new Error("node:child_process no está disponible en el navegador");
};
export const execFile = unavailable;
export const spawn = unavailable;
export default { execFile, spawn };
