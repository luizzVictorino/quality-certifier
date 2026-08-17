import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Build estático (SPA) usado pelo executável Windows.
// Não usa SSR, worker, nem servidor Node: tudo roda no WebView2 via file://.
export default defineConfig({
  root: fileURLToPath(new URL("./desktop/web", import.meta.url)),
  base: "./",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./desktop/dist-web", import.meta.url)),
    emptyOutDir: true,
    target: "chrome110",
  },
});
