import { useLayoutEffect, useRef, useState } from "react";
import type { Certificado, Lote } from "@/lib/nfe";
import logo from "@/assets/sato-logo.jpg";

const PAGE_H = 1123;
const PAD_TOP = 20;
const PAD_BOTTOM = 48;
const AVAIL = PAGE_H - PAD_TOP - PAD_BOTTOM;
const GAP = 24; /* .doc-espaco min-height */

const Cabecalho = () => (
  <div className="doc-header">
    <img src={logo} alt="SATO Auto-ID do Brasil" className="doc-logo" />
    <div className="doc-empresa">
      <strong>SATO AUTO-ID DO BRASIL</strong>
      <span>Rua Cidade de Bagda, 479 Vila Santa Catarina São Paulo – SP.</span>
      <span>CEP: 04377-036 TEL: 11 5033-5577 www.satobrasil.com.br</span>
    </div>
  </div>
);

const Rodape = ({ c }: { c: Certificado }) => (
  <div className="doc-rodape">
    <span>
      {c.tipo === "ribbon" ? "Emitido:" : "Emitido por:"} {c.emitidoPor}
    </span>
    <span>Data: {c.dataEmissaoCertificado}</span>
  </div>
);

/* ---------- blocos ---------- */

function TopoRibbon({ c }: { c: Certificado }) {
  return (
    <>
      <h1 className="doc-titulo">CERTIFICADO DE QUALIDADE</h1>
      <table className="doc-tabela">
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Codigo SATO</th>
            <th>Cliente</th>
            <th>Modelo Ribbon</th>
            <th>Largura</th>
            <th>Comprimento</th>
            <th>Ent.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{c.codigoSato}</td>
            <td>{c.cliente}</td>
            <td>{c.modelo}</td>
            <td>{c.largura}</td>
            <td>{c.comprimento}</td>
            <td>{c.entintamento}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function TopoEtiqueta({ c }: { c: Certificado }) {
  return (
    <>
      <h1 className="doc-titulo" style={{ marginBottom: 30 }}>
        CERTIFICADO DE QUALIDADE
      </h1>
      <table className="doc-tabela doc-tabela-dados">
        <tbody>
          <tr>
            <th>Código SAaaaTO</th>
            <td>{c.codigoSato}</td>
            <th>Cliente</th>
            <td>{c.cliente}</td>
          </tr>
          <tr>
            <th>Nota Fiscal</th>
            <td>{c.notaFiscal}</td>
            <th>Série</th>
            <td>{c.serie}</td>
          </tr>
          <tr>
            <th>Data de Emissão</th>
            <td>{c.dataEmissao}</td>
            <th>Unidade</th>
            <td>{c.unidade}</td>
          </tr>
          <tr>
            <th>Modelo</th>
            <td>{c.modelo}</td>
            <th>Quantidade Total</th>
            <td>{c.quantidadeTotal}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function BaseRibbon({ c }: { c: Certificado }) {
  return (
    <>
      <table className="doc-tabela .doc-tabela2">
        <thead>
          <tr>
            <th>NOTA FISCAL</th>
            <th>SERIE</th>
            <th>DATA DE EMISSÃO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{c.notaFiscal}</td>
            <td>{c.serie}</td>
            <td>{c.dataEmissao}</td>
          </tr>
        </tbody>
      </table>

      <p className="doc-texto">
        <strong>Condições de armazenamento</strong> que devem ser obedecidas para garantir a
        validade do produto: Umidade de 20 a 80% e Temperatura de 5 a 35°C.
      </p>
      <p className="doc-texto">
        <strong>Divergências/ Substituições/ Não-conformidades:</strong>
      </p>
      <p className="doc-texto">
        <strong>NÃO CONFORMIDADE:</strong> Nenhum material deverá ser devolvido sem prévia
        comunicação a SATO BRASIL, inclusive em casos de divergência, não-conformidade ou
        reposição.Toda e qualquer divergência receberá a devida tratativa pela SATO.
      </p>
      <p className="doc-texto">
        <strong>DECLARAÇÃO:</strong> SATO AUTO ID DO BRASIL declara que o material/ item
        identificado acima e toda documentação requerida está de acordo com os requerimentos
        solicitados na Ordem de Compra/Contrato. Além disto, as informações prestadas estão
        acuradas, completas e são verdadeiras.
      </p>
    </>
  );
}

function BaseEtiqueta() {
  return (
    <>
      <p className="doc-texto">
        A <strong>SATO AUTO-ID DO BRASIL</strong>, declara que o produto especificado acima esta de
        acordo com as especificações solicitadas na Ordem de Compra, o qual foi fabricado e atende
        os padrões de qualidade e requisitos técnicos.
      </p>
      <p className="doc-texto">
        Em caso de divergência, alteração e/ou não-conformidade, não enviar nenhum material ou
        produto a SATO sem uma comunicação prévia.
      </p>
      <p className="doc-texto">
        A especificação técnica do produto está disponível mediante consulta ao time SATO.
      </p>
      <p className="doc-texto">
        A garantia deste produto e de 1 ano, contados a partir da data de emissão da Nota Fiscal de
        venda.
      </p>
    </>
  );
}

function TabelaLotes({
  c,
  lotes,
  headRef,
  rowRef,
}: {
  c: Certificado;
  lotes: Lote[];
  headRef?: (el: HTMLTableSectionElement | null) => void;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  const ribbon = c.tipo === "ribbon";
  return (
    <table className="doc-tabela .doc-tabela2">
      <thead ref={headRef}>
        <tr>
          <th>{ribbon ? "Lote Sato" : "Lote"}</th>
          {ribbon && <th>Lote Fabricante</th>}
          <th>Quantidade</th>
          <th>Unidade</th>
        </tr>
      </thead>
      <tbody>
        {lotes.map((l, i) => (
          <tr key={i} ref={i === 0 ? rowRef : undefined}>
            <td>{l.nLote || (c.semLote ? "—" : "")}</td>
            {ribbon && <td>{l.loteFabricante}</td>}
            <td>{l.qLote}</td>
            <td>{c.unidade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- documento paginado ---------- */

type Medidas = {
  header: number;
  topo: number;
  base: number;
  loteHead: number;
  row: number;
  rodape: number;
};

export function CertificadoDoc({
  c,
  innerRef,
}: {
  c: Certificado;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const [medidas, setMedidas] = useState<Medidas | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const medidoPara = useRef<string | null>(null);

  const probeKey = `${c.tipo}|${c.cliente}|${c.modelo}|${c.codigoSato}`;

  useLayoutEffect(() => {
    if (medidoPara.current === probeKey) return;
    const h = (k: string) => refs.current[k]?.getBoundingClientRect().height ?? 0;
    const row = h("row");
    if (!row) return;
    medidoPara.current = probeKey;
    setMedidas({
      header: h("header"),
      topo: h("topo"),
      base: h("base"),
      loteHead: h("loteHead"),
      row,
      rodape: h("rodape"),
    });
  }, [probeKey]);


  const Topo = c.tipo === "ribbon" ? <TopoRibbon c={c} /> : <TopoEtiqueta c={c} />;
  const Base = c.tipo === "ribbon" ? <BaseRibbon c={c} /> : <BaseEtiqueta />;

  if (!medidas) {
    /* passo de medição — mesma estrutura, uma linha de lote */
    return (
      <div ref={innerRef}>
        <div className="doc-page">
          <div ref={(el) => { refs.current["header"] = el; }}>
            <Cabecalho />
          </div>
          <div ref={(el) => { refs.current["topo"] = el; }}>{Topo}</div>
          <TabelaLotes
            c={c}
            lotes={c.lotes.length ? [c.lotes[0]!] : [{ nLote: "1", qLote: "1", loteFabricante: "1" }]}
            headRef={(el) => { refs.current["loteHead"] = el; }}
            rowRef={(el) => { refs.current["row"] = el; }}
          />
          <div ref={(el) => { refs.current["base"] = el; }}>{Base}</div>
          <div className="doc-espaco" />
          <div ref={(el) => { refs.current["rodape"] = el; }}>
            <Rodape c={c} />
          </div>
        </div>
      </div>
    );
  }

  const capPrimeira = AVAIL - medidas.header - medidas.topo - medidas.loteHead - medidas.rodape - GAP;
  const capOutras = AVAIL - medidas.header - medidas.loteHead - medidas.rodape - GAP;

  const grupos: Lote[][] = [];
  let i = 0;
  const lotes = c.lotes.length ? c.lotes : [];
  while (i < lotes.length) {
    const cap = grupos.length === 0 ? capPrimeira : capOutras;
    const n = Math.max(1, Math.floor(cap / medidas.row));
    grupos.push(lotes.slice(i, i + n));
    i += n;
  }
  if (grupos.length === 0) grupos.push([]);

  const capUltima = grupos.length === 1 ? capPrimeira : capOutras;
  const usado = (grupos[grupos.length - 1]?.length ?? 0) * medidas.row;
  const basePaginaNova = capUltima - usado < medidas.base;

  return (
    <div ref={innerRef}>
      {grupos.map((grupo, idx) => (
        <div className="doc-page" key={idx}>
          <Cabecalho />
          {idx === 0 && Topo}
          <TabelaLotes c={c} lotes={grupo} />
          {idx === grupos.length - 1 && !basePaginaNova && Base}
          <div className="doc-espaco" />
          <Rodape c={c} />
        </div>
      ))}
      {basePaginaNova && (
        <div className="doc-page">
          <Cabecalho />
          {Base}
          <div className="doc-espaco" />
          <Rodape c={c} />
        </div>
      )}
    </div>
  );
}
