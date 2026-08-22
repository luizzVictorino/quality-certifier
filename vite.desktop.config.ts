import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Build estático (SPA) usado pelo executável Windows.
// Não usa SSR, worker, nem servidor Node: tudo roda no WebView2 via file://.
export default defineConfig({
  // O root permanece na raiz do projeto para que o Tailwind detecte as classes
  // usadas em src/ (com root em desktop/web o CSS saía incompleto).
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
    rollupOptions: {
      input: fileURLToPath(new URL("./desktop/web/index.html", import.meta.url)),
    },
  },
});

