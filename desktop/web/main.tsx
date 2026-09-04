import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createHashHistory, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { routeTree } from "@/routeTree.gen";
import "@/styles.css";

// No app web (SSR) a rota raiz renderiza o documento inteiro (<html>/<body>).
// No executável montamos dentro de um #root já existente, então esse "shell"
// criaria um <html> aninhado — o que faz o React entrar em loop infinito ao
// tratar eventos de elementos em portal (modal). Aqui usamos um shell neutro.
(routeTree as unknown as { options: Record<string, unknown> }).options.shellComponent =
  ({ children }: { children: React.ReactNode }) => children;

const queryClient = new QueryClient();


const router = createRouter({
  routeTree,
  context: { queryClient },
  history: createHashHistory(),
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
