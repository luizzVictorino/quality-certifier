import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { FileUp, FileText, Loader2, Download, Eye, Layers, FileArchive, Save, Trash2 } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { CertificadoDoc } from "@/components/CertificadoDoc";
import { EditorCertificado } from "@/components/EditorCertificado";
import { parseNFe, nomeArquivo, NFeError, type Certificado, type NFeResumo } from "@/lib/nfe";
import { elementToPdfBlob, elementsToSinglePdfBlob, downloadBlob } from "@/lib/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Certificados de Qualidade | SATO" },
      {
        name: "description",
        content:
          "Gere certificados de qualidade em PDF automaticamente a partir do XML da NF-e, com identificação de Ribbon e Etiqueta e controle de lotes.",
      },
      { property: "og:title", content: "Gerador de Certificados de Qualidade | SATO" },
      {
        property: "og:description",
        content:
          "Upload do XML da NF-e, leitura automática dos itens e lotes, edição e download dos certificados em PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MAX_BYTES = 10 * 1024 * 1024;

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [xmlText, setXmlText] = useState<string>("");
  const [resumo, setResumo] = useState<NFeResumo | null>(null);
  const [certs, setCerts] = useState<Certificado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Certificado | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const docRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const emEdicao = useMemo(() => certs.find((c) => c.id === aberto) ?? null, [certs, aberto]);

  const abrir = (c: Certificado) => {
    setRascunho({ ...c, lotes: c.lotes.map((l) => ({ ...l })) });
    setAberto(c.id);
  };

  const fechar = () => {
    setAberto(null);
    setRascunho(null);
  };

/*   const salvarEdicao = () => {
    if (!rascunho) return;
    setCerts((prev) => prev.map((x) => (x.id === rascunho.id ? rascunho : x)));
    toast.success("Informações do certificado salvas.");
    fechar();
  }; */

  const formatarQuantidadeLote = (valor: string) => {
  if (!valor.trim()) return "";

  const numero = Number(
    valor.replace(/\./g, "").replace(",", ".")
  );

  if (Number.isNaN(numero)) return valor;

  return numero.toFixed(3).replace(".", ",");
};

const salvarEdicao = () => {
  if (!rascunho) return;

  const certificadoAtualizado: Certificado = {
    ...rascunho,
    lotes: rascunho.lotes.map((lote) => ({
      ...lote,
      qLote: formatarQuantidadeLote(lote.qLote),
    })),
  };

  setCerts((prev) =>
    prev.map((x) =>
      x.id === certificadoAtualizado.id
        ? certificadoAtualizado
        : x
    )
  );

  toast.success("Informações do certificado salvas.");

  fechar();
};


  /*----------------------------------------------------------------------------*/

  const limpar = () => {
    setFile(null);
    setXmlText("");
    setResumo(null);
    setCerts([]);
    setErro(null);
    fechar();
    docRefs.current = {};
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Informações do XML removidas.");
  };


  const selecionar = async (f: File) => {
    setErro(null);
    setResumo(null);
    setCerts([]);
    if (!f.name.toLowerCase().endsWith(".xml")) {
      setErro("Selecione um arquivo com extensão .xml.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setErro("Arquivo muito grande. O limite é de 10 MB.");
      return;
    }
    setFile(f);
    setXmlText(await f.text());
  };

  const processar = () => {
    setErro(null);
    try {
      const { resumo: r, certificados } = parseNFe(xmlText);
      setResumo(r);
      setCerts(certificados);
      toast.success(`XML processado: ${r.itens} itens, ${certificados.length} certificados.`);
    } catch (e) {
      const msg =
        e instanceof NFeError
          ? e.message
          : "Não foi possível ler o arquivo XML. Verifique se é uma NF-e válida.";
      setResumo(null);
      setCerts([]);
      setErro(`Não foi possível gerar o certificado. ${msg}`);
    }
  };

  const baixarUm = async (c: Certificado) => {
    const el = docRefs.current[c.id];
    if (!el) return;
    setBusy(true);
    try {
      downloadBlob(await elementToPdfBlob(el), nomeArquivo(c));
    } finally {
      setBusy(false);
    }
  };

  const baixarZip = async () => {
    setBusy(true);
    try {
      const zip = new JSZip();
      for (const c of certs) {
        const el = docRefs.current[c.id];
        if (!el) continue;
        zip.file(nomeArquivo(c), await elementToPdfBlob(el));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `Certificados_NF_${resumo?.nNF ?? "NFe"}.zip`);
      toast.success("ZIP gerado com todos os certificados.");
    } finally {
      setBusy(false);
    }
  };

  const pdfUnico = async () => {
    setBusy(true);
    try {
      const els = certs.map((c) => docRefs.current[c.id]).filter(Boolean) as HTMLDivElement[];
      downloadBlob(
        await elementsToSinglePdfBlob(els),
        `Certificados_NF_${resumo?.nNF ?? "NFe"}.pdf`,
      );
      toast.success("PDF consolidado gerado.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Gerador de Certificados de Qualidade
            </h1>
            <p className="text-xs text-muted-foreground">
              Leitura automática do XML da NF-e · Ribbon e Etiqueta · Processamento local
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Upload */}
        <Card className="p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) void selecionar(f);
            }}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center"
          >
            <FileUp className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Arraste o XML da NF-e aqui</p>
            <p className="mb-4 text-xs text-muted-foreground">Somente arquivos .xml (até 10 MB)</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xml,text/xml,application/xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void selecionar(f);
              }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                Selecionar XML
              </Button>
              <Button onClick={processar} disabled={!xmlText}>
                Processar XML
              </Button>
              <Button
                variant="ghost"
                onClick={limpar}
                disabled={!xmlText && !resumo && !file}
              >
                <Trash2 /> Limpar
              </Button>
            </div>
            {file && (
              <p className="mt-3 text-xs text-muted-foreground">
                Arquivo selecionado: <span className="font-medium text-foreground">{file.name}</span>
              </p>
            )}
          </div>

          {erro && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {erro}
            </div>
          )}
        </Card>

        {resumo && (
          <>
            {/* Resumo */}
            <Card className="grid gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["NF", resumo.nNF],
                ["Série", resumo.serie],
                ["Data", resumo.data],
                ["Cliente", resumo.cliente],
                ["Itens encontrados", String(resumo.itens)],
                ["Certificados a gerar", String(certs.length)],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="text-sm font-semibold">{v}</p>
                </div>
              ))}
            </Card>

            {/* Ações */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={pdfUnico} disabled={busy || certs.length === 0}>
                {busy ? <Loader2 className="animate-spin" /> : <Layers />} Gerar PDF único
              </Button>
              <Button variant="outline" onClick={baixarZip} disabled={busy || certs.length === 0}>
                {busy ? <Loader2 className="animate-spin" /> : <FileArchive />} Baixar todos (ZIP)
              </Button>
            </div>

            {/* Tabela */}
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Un.</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nItem}</TableCell>
                      <TableCell className="font-medium">{c.codigoSato}</TableCell>
                      <TableCell className="max-w-[240px] truncate" title={c.descricao}>
                        {c.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.tipo === "ribbon" ? "default" : "secondary"}>
                          {c.tipo === "ribbon" ? "Ribbon" : "Etiqueta"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {c.semLote ? (
                          <span className="text-muted-foreground">Sem lote informado</span>
                        ) : (
                          c.lotes.map((l, i) => <div key={i}>{l.nLote}</div>)
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {c.lotes.map((l, i) => (
                          <div key={i}>{l.qLote}</div>
                        ))}


{/*                       <TableCell className="text-xs">
                        {c.lotes.length === 0 ? (
                          <span className="text-muted-foreground">
                            Sem lote informado
                          </span>
                        ) : (
                          c.lotes
                            .filter((l) => l.nLote.trim() !== "")
                            .map((l, i) => <div key={i}>{l.nLote}</div>)
                        )}
                      </TableCell>
                      
                      <TableCell className="text-xs">
                        {c.lotes.length === 0 ? (
                          <span>{c.quantidadeTotal}</span>
                        ) : (
                          c.lotes
                            .filter((l) => l.nLote.trim() !== "")
                            .map((l, i) => <div key={i}>{l.qLote}</div>)
                        )}
                      </TableCell> */}


                      { /*----------------------*/}
                      </TableCell>
                      <TableCell>{c.unidade}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => abrir(c)}>
                            <Eye /> Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void baixarUm(c)}
                          >
                            <Download /> PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </main>

      {/* Documentos renderizados fora da tela — fonte para os PDFs */}
      <div className="pointer-events-none fixed -left-[10000px] top-0" aria-hidden>
        {certs.map((c) => (
          <CertificadoDoc
            key={c.id}
            c={c}
            innerRef={(el) => {
              docRefs.current[c.id] = el;
            }}
          />
        ))}
      </div>

      {/* Visualização + edição */}
      <Dialog open={!!emEdicao && !!rascunho} onOpenChange={(o) => !o && fechar()}>
        <DialogContent className="max-h-[92vh] max-w-[1200px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Certificado {rascunho?.codigoSato} —{" "}
              {rascunho?.tipo === "ribbon" ? "Ribbon" : "Etiqueta"}
            </DialogTitle>
          </DialogHeader>
          {rascunho && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
              <EditorCertificado c={rascunho} onChange={setRascunho} />
              <div className="overflow-auto rounded-md border border-border bg-muted p-4">
                <div className="origin-top-left scale-[0.72]">
                  <CertificadoDoc c={rascunho} />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={fechar}>
              Fechar
            </Button>
            <Button variant="secondary" onClick={salvarEdicao}>
              <Save /> Salvar alterações
            </Button>
            <Button disabled={busy} onClick={() => emEdicao && void baixarUm(emEdicao)}>
              {busy ? <Loader2 className="animate-spin" /> : <Download />} Baixar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
