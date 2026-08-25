import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Phase =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "ready"
  | "error";

type UpdaterState = {
  phase: Phase;
  currentVersion: string;
  newVersion: string | null;
  percent: number;
  message: string | null;
};

type UpdaterApi = {
  isDesktop: boolean;
  getStatus: () => Promise<UpdaterState>;
  check: () => Promise<UpdaterState>;
  download: () => Promise<UpdaterState>;
  install: () => Promise<UpdaterState>;
  onState: (cb: (s: UpdaterState) => void) => () => void;
};

declare global {
  interface Window {
    qcUpdater?: UpdaterApi;
  }
}

/**
 * Camada adicional: só aparece no aplicativo desktop (Electron).
 * No navegador o componente não renderiza nada.
 */
export function AtualizacaoApp() {
  const [api, setApi] = useState<UpdaterApi | null>(null);
  const [state, setState] = useState<UpdaterState | null>(null);
  const [aberto, setAberto] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const u = typeof window !== "undefined" ? window.qcUpdater : undefined;
    if (!u) return;
    setApi(u);
    void u.getStatus().then(setState);
    return u.onState((s) => {
      setState(s);
      if (s.phase === "available" || s.phase === "downloading" || s.phase === "ready") {
        setAberto(true);
      }
    });
  }, []);

  const verificar = useCallback(async () => {
    if (!api) return;
    setManual(true);
    setAberto(true);
    setState(await api.check());
  }, [api]);

  if (!api) return null;

  const phase = state?.phase ?? "idle";
  const atual = state?.currentVersion ?? "";
  const nova = state?.newVersion ?? "";

  const mostrarDialog =
    aberto &&
    (phase === "available" ||
      phase === "downloading" ||
      phase === "ready" ||
      (manual && (phase === "checking" || phase === "not-available" || phase === "error")));

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void verificar()}
        className="gap-2 text-xs text-muted-foreground"
      >
        <RefreshCw className="size-3.5" />
        Verificar atualizações
      </Button>

      <Dialog
        open={mostrarDialog}
        onOpenChange={(o) => {
          if (!o && phase !== "downloading") {
            setAberto(false);
            setManual(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {phase === "checking" && (
            <>
              <DialogHeader>
                <DialogTitle>Verificando atualizações</DialogTitle>
                <DialogDescription>Versão atual: {atual}</DialogDescription>
              </DialogHeader>
              <Progress value={undefined} className="h-2" />
            </>
          )}

          {phase === "not-available" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  Você já está utilizando a versão mais recente
                </DialogTitle>
                <DialogDescription>Versão atual: {atual}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <Button onClick={() => setAberto(false)}>Fechar</Button>
              </div>
            </>
          )}

          {phase === "available" && (
            <>
              <DialogHeader>
                <DialogTitle>Nova atualização disponível</DialogTitle>
                <DialogDescription>
                  Versão atual: {atual} · Nova versão: {nova}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Uma nova versão do Quality Certifier está disponível.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Depois
                </Button>
                <Button className="gap-2" onClick={() => void api.download()}>
                  <Download className="size-4" />
                  Atualizar agora
                </Button>
              </div>
            </>
          )}

          {phase === "downloading" && (
            <>
              <DialogHeader>
                <DialogTitle>Baixando atualização...</DialogTitle>
                <DialogDescription>Não feche o aplicativo.</DialogDescription>
              </DialogHeader>
              <Progress value={state?.percent ?? 0} className="h-2" />
              <p className="text-right text-xs text-muted-foreground">
                {state?.percent ?? 0}%
              </p>
            </>
          )}

          {phase === "ready" && (
            <>
              <DialogHeader>
                <DialogTitle>Atualização pronta</DialogTitle>
                <DialogDescription>
                  A nova versão {nova} está pronta para ser instalada.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                O aplicativo será reiniciado para concluir a atualização.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Depois
                </Button>
                <Button onClick={() => void api.install()}>Reiniciar e atualizar</Button>
              </div>
            </>
          )}

          {phase === "error" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  Não foi possível verificar atualizações
                </DialogTitle>
                <DialogDescription>
                  {state?.message ?? "O aplicativo continuará funcionando normalmente."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Fechar
                </Button>
                <Button className="gap-2" onClick={() => void api.check()}>
                  <RefreshCw className="size-4" />
                  Tentar novamente
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
