import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // El SDK de Anthropic referencia varios builtins de Node desde submódulos
    // (agent toolset / environments) que no se usan en el navegador. Los apuntamos
    // a shims browser-safe. Usamos regex ancladas para que `node:stream` no
    // capture `node:stream/promises`.
    alias: [
      { find: /^node:crypto$/, replacement: fileURLToPath(new URL("./src/shims/node-crypto.ts", import.meta.url)) },
      { find: /^node:stream\/promises$/, replacement: fileURLToPath(new URL("./src/shims/node-stream-promises.ts", import.meta.url)) },
      { find: /^node:stream$/, replacement: fileURLToPath(new URL("./src/shims/node-stream.ts", import.meta.url)) },
      { find: /^node:util$/, replacement: fileURLToPath(new URL("./src/shims/node-util.ts", import.meta.url)) },
      { find: /^node:child_process$/, replacement: fileURLToPath(new URL("./src/shims/node-child_process.ts", import.meta.url)) },
    ],
  },
  server: {
    port: 5173,
    host: true,
  },
});
