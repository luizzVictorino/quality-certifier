import type { Certificado, Lote } from "@/lib/nfe";
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  );
}

export function EditorCertificado({ c, onChange }: Props) {
  const set = (patch: Partial<Certificado>) => onChange({ ...c, ...patch });
  const setLote = (i: number, patch: Partial<Lote>) => {
    const lotes = c.lotes.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange({ ...c, lotes });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Código SATO" value={c.codigoSato} onChange={(v) => set({ codigoSato: v })} />
        <Campo label="Cliente" value={c.cliente} onChange={(v) => set({ cliente: v })} />
        <Campo
          label={c.tipo === "ribbon" ? "Modelo" : "Produto (descrição)"}
          value={c.modelo}
          onChange={(v) => set({ modelo: v })}
        />
        {c.tipo === "ribbon" ? (
          <>
            <Campo label="Largura" value={c.largura} onChange={(v) => set({ largura: v })} />
            <Campo
              label="Comprimento"
              value={c.comprimento}
              onChange={(v) => set({ comprimento: v })}
            />
            <Campo label="Ent" value={c.entrega} onChange={(v) => set({ entrega: v })} />
          </>
        ) : (
          <>
            <Campo label="Medida" value={c.medida} onChange={(v) => set({ medida: v })} />
            <Campo
              label="Etiquetas x Rolo"
              value={c.etiquetasPorRolo}
              onChange={(v) => set({ etiquetasPorRolo: v })}
            />
            <Campo
              label="Quantidade total"
              value={c.quantidadeTotal}
              onChange={(v) => set({ quantidadeTotal: v })}
            />
            <Campo
              label="Pedido do Cliente"
              value={c.pedidoCliente}
              onChange={(v) => set({ pedidoCliente: v })}
            />
            <Campo
              label="Pedido SATO"
              value={c.pedidoSato}
              onChange={(v) => set({ pedidoSato: v })}
            />
          </>
        )}
        <Campo label="Nota Fiscal" value={c.notaFiscal} onChange={(v) => set({ notaFiscal: v })} />
        <Campo label="Série" value={c.serie} onChange={(v) => set({ serie: v })} />
        <Campo
          label="Data de emissão da NF"
          value={c.dataEmissao}
          onChange={(v) => set({ dataEmissao: v })}
        />
        <Campo label="Unidade" value={c.unidade} onChange={(v) => set({ unidade: v })} />
        <Campo
          label="Emitido por"
          value={c.emitidoPor}
          onChange={(v) => set({ emitidoPor: v })}
        />
        <Campo
          label="Data do certificado"
          value={c.dataEmissaoCertificado}
          onChange={(v) => set({ dataEmissaoCertificado: v })}
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">
          Lotes {c.semLote && <span className="text-muted-foreground">(item sem rastro no XML)</span>}
        </h4>
        {c.lotes.map((l, i) => (
          <div
            key={i}
            className={`grid gap-3 rounded-md border border-border bg-secondary/40 p-3 ${c.tipo === "ribbon" ? "grid-cols-3" : "grid-cols-2"}`}
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
        ))}
      </div>
    </div>
  );
}
