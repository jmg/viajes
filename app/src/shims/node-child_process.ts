// Shim browser-safe de node:child_process.
export const execFile = (): never => {
  throw new Error("node:child_process no está disponible en el navegador");
};
export default { execFile };
