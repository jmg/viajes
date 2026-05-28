// Shim browser-safe de node:stream/promises.
export const pipeline = async (): Promise<never> => {
  throw new Error("node:stream/promises no está disponible en el navegador");
};
export default { pipeline };
