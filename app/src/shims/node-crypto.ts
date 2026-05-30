// Shim de node:crypto para el bundle de browser. El SDK de Anthropic referencia
// `randomUUID` desde un submódulo (agent-toolset) que no usamos en el navegador,
// pero el bundler igual lo resuelve. El browser ya expone crypto.randomUUID.
export const randomUUID = (): string => globalThis.crypto.randomUUID();

export default { randomUUID };
