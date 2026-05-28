// Shim browser-safe de node:stream. Solo se referencia desde código Node-only
// del SDK (agent toolset / environments) que no se ejecuta en el navegador.
export class Readable {}
export default { Readable };
