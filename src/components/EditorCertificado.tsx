import { Plus, Trash2 } from "lucide-react";
import type { Certificado, Lote } from "@/lib/nfe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type Props = {
  c: Certificado;
  onChange: (c: Certificado) => void;
};

function Campo({
  label,
  value,
  onChange,
  readOnly = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input 
        value={value} 
        onChange={(e) => 
        onChange(e.target.value)} 
        readOnly={readOnly}
        disabled={disabled}
         className="h-9" 
      />
    </div>
  );
}

export function EditorCertificado({ c, onChange }: Props) {
  const set = (patch: Partial<Certificado>) => onChange({ ...c, ...patch });
  const setLote = (i: number, patch: Partial<Lote>) => {
    const lotes = c.lotes.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange({ ...c, lotes });
  };
/*   const addLote = () =>
    onChange({
      ...c,
      semLote: false,
      lotes: [...c.lotes, { nLote: "", qLote: "", loteFabricante: "" }],
    });
  const removeLote = (i: number) =>
    onChange({ ...c, lotes: c.lotes.filter((_, idx) => idx !== i) }); */
  
  /*Alteração*/
  const addLote = () =>
  onChange({
    ...c,
    semLote: false,
    lotes: [
      ...c.lotes,
      {
        nLote: "",
        qLote: "",
        loteFabricante: "",
      },
    ],
  });

  const removeLote = (i: number) => {
    const lotes = c.lotes.filter((_, idx) => idx !== i);
  
    onChange({
      ...c,
      lotes,
      semLote: lotes.length === 0,
    });
  };

/*-------------------------*/

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Campo 
          label="Código SATO" 
          value={c.codigoSato} 
          onChange={(v) => 
          set({ codigoSato: v })} 
          readOnly 
        />
        <Campo 
          label="Cliente" 
          value={c.cliente} 
          onChange={(v) => 
          set({ cliente: v })} 
          disabled 
        />
        <Campo
          label={c.tipo === "ribbon" ? "Modelo" : "Produto (descrição)"}
          value={c.modelo}
          onChange={(v) => set({ modelo: v })}
          disabled
        />
        <Campo 
          label="Largura" value={c.largura} 
          onChange={(v) => 
          set({ largura: v })} 
          disabled
        />
        <Campo
          label="Comprimento"
          value={c.comprimento}
          onChange={(v) => set({ comprimento: v })}
          disabled
        />
        {c.tipo === "ribbon" && (
          <Campo 
            label="Ent" 
            value={c.entintamento} 
            onChange={(v) => set({ entintamento: v })} 
          />
        )}

        <Campo 
          label="Nota Fiscal" 
          value={c.notaFiscal} 
          onChange={(v) => 
          set({ notaFiscal: v })} 
          disabled
        />
        <Campo 
          label="Série" 
          value={c.serie} 
          onChange={(v) => 
          set({ serie: v })} 
          disabled 
        />
        <Campo
          label="Data de emissão da NF"
          value={c.dataEmissao}
          onChange={(v) => 
          set({ dataEmissao: v })}
          disabled
        />
        <Campo 
          label="Unidade" 
          value={c.unidade} 
          onChange={(v) => 
          set({ unidade: v })} 
          disabled
        />
        <Campo
          label="Emitido por"
          value={c.emitidoPor}
          onChange={(v) => 
          set({ emitidoPor: v })}
          
          disabled
        />
        <Campo
          label="Data do certificado"
          value={c.dataEmissaoCertificado}
          onChange={(v) => 
          set({ dataEmissaoCertificado: v })}
          disabled
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            Lotes{" "}
            {c.semLote && <span className="text-muted-foreground">(item sem rastro no XML)</span>}
          </h4>
          <Button type="button" size="sm" variant="outline" onClick={addLote}>
            <Plus /> Adicionar Lote
          </Button>
        </div>
        {c.lotes.map((l, i) => (
          <div key={i} className="rounded-md border border-border bg-secondary/40 p-3">
            <div
              className={`grid gap-3 ${c.tipo === "ribbon" ? "grid-cols-3" : "grid-cols-2"}`}
            >
              <Campo label="Lote SATO" value={l.nLote} onChange={(v) => setLote(i, { nLote: v })} />
              {c.tipo === "ribbon" && (
                <Campo
                  label="Lote Fabricante"
                  value={l.loteFabricante}
                  onChange={(v) => setLote(i, { loteFabricante: v })}
                />
              )}
              <Campo
                label="Quantidade"
                value={l.qLote}
                onChange={(v) => setLote(i, { qLote: v })}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => removeLote(i)}
              >
                <Trash2 /> Remover
              </Button>
            </div>
          </div>
        ))}
        {c.lotes.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum lote. Adicione um lote manualmente.</p>
        )}
      </div>

    </div>
  );
}
