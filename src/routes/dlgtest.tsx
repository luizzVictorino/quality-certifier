import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dlgtest")({
  head: () => ({ meta: [{ title: "Teste de modal" }, { name: "description", content: "Teste" }] }),
  component: () => {
    const [o, setO] = useState(false);
    return (
      <div className="p-10">
        <Button onClick={() => setO(true)}>Visualizar</Button>
        <Dialog open={o} onOpenChange={setO}>
          <DialogContent>
            <DialogHeader><DialogTitle>Teste</DialogTitle></DialogHeader>
            <p>conteudo</p>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});
