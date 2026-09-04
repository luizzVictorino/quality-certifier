export type Lote = {
  nLote: string;
  qLote: string;
  dFab?: string | undefined;
  dVal?: string | undefined;
  loteFabricante: string;
};

export type Certificado = {
  id: string;
  nItem: number;
  tipo: "ribbon" | "etiqueta";
  codigoSato: string;
  descricao: string;
  cliente: string;
  modelo: string;
  medida: string;
  largura: string;
  comprimento: string;
  etiquetasPorRolo: string;
  unidade: string;
  quantidadeTotal: string;
  notaFiscal: string;
  serie: string;
  dataEmissao: string;
  pedidoCliente: string;
  pedidoSato: string;
  entintamento: string;
  emitidoPor: string;
  dataEmissaoCertificado: string;
  lotes: Lote[];
  semLote: boolean;
  /** Somente para clientes com regra de código de cliente (ex.: Delly Kosmetic). */
  exibeCodigoCliente: boolean;
  codigoCliente: string;
};

export type NFeResumo = {
  nNF: string;
  serie: string;
  cliente: string;
  data: string;
  itens: number;
};

export class NFeError extends Error {}

const txt = (el: Element | null | undefined, tag: string): string | null => {
  if (!el) return null;
  const found = el.getElementsByTagName(tag);
  for (let i = 0; i < found.length; i++) {
    const v = found[i]?.textContent?.trim();
    if (v) return v;
  }
  return null;
};

/** Direct children by tag name (namespace-safe via localName). */
const kids = (el: Element, tag: string): Element[] =>
  Array.from(el.children).filter((c) => c.localName === tag);

export const formatarData = (iso: string): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) throw new NFeError(`Data de emissão inválida: ${iso}`);
  return `${m[3]}/${m[2]}/${m[1]}`;
};

export const formatarQuantidade = (valor: string): string => {
  const n = Number(valor);
  if (Number.isNaN(n)) return valor;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

/** Divide <xProd> por "-" e normaliza espaços. */
export const partesDescricao = (xProd: string): string[] =>
  xProd
    .split("-")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

/** Extrai as duas primeiras dimensões (110mm X 450M -> 110 / 450). */
export const extrairDimensoes = (trecho: string) => {
  const nums = trecho.match(/(\d+(?:[.,]\d+)?)\s*(?:mm|cm|m)\b/gi) ?? [];

  const limpar = (s?: string) => 
    s ? s.replace(/\s+/g, "").trim() : "";
  return { 
    largura: limpar(nums[0]), 
    comprimento: limpar(nums[1]) };
};

const extrairEtqPorRolo = (xProd: string): string => {
  const m = xProd.match(/([\d.,]+)\s*ETQS?\s*\/\s*RL/i);
  return m?.[1] ?? "";
};

/** CNPJ do cliente que exige o campo "Código Cliente" no certificado. */
export const CNPJ_DELLY_KOSMETIC = "01567613000178";

export const normalizarCNPJ = (v: string | null | undefined): string =>
  (v ?? "").replace(/\D/g, "");

export const clientePermiteCodigoCliente = (cnpj: string | null | undefined): boolean =>
  normalizarCNPJ(cnpj) === CNPJ_DELLY_KOSMETIC;

/** Extrai o valor após "Codigo Cliente :" do <infAdProd>. */
export function extrairCodigoCliente(infAdProd: string | null | undefined): string | null {
  if (!infAdProd) return null;
  const match = infAdProd.match(/c[oó]digo\s*cliente\s*:\s*(\S+)/i);
  return match?.[1]?.trim() ?? null;
}

export function parseNFe(xmlText: string): { resumo: NFeResumo; certificados: Certificado[] } {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new NFeError("Arquivo XML inválido ou corrompido.");
  }

  const infNFe = doc.getElementsByTagName("infNFe")[0];
  if (!infNFe) throw new NFeError("O arquivo não é uma NF-e válida (tag <infNFe> não encontrada).");

  const ide = doc.getElementsByTagName("ide")[0];
  if (!ide) throw new NFeError("NF-e sem a tag obrigatória <ide>.");

  const nNF = txt(ide, "nNF");
  if (!nNF) throw new NFeError("NF-e sem a tag obrigatória <nNF>.");

  const serieEl = kids(ide, "serie")[0]?.textContent?.trim();
  if (serieEl === undefined) throw new NFeError("NF-e sem a tag obrigatória <serie>.");

  const dhEmi = txt(ide, "dhEmi");
  if (!dhEmi) throw new NFeError("NF-e sem a tag obrigatória <dhEmi>.");
  const dataEmissao = formatarData(dhEmi);

  const dest = doc.getElementsByTagName("dest")[0];
  const cliente = txt(dest, "xNome");
  if (!cliente) throw new NFeError("NF-e sem o nome do destinatário (<dest><xNome>).");
  const exibeCodigoCliente = clientePermiteCodigoCliente(txt(dest, "CNPJ"));

  const dets = Array.from(doc.getElementsByTagName("det"));
  if (dets.length === 0) throw new NFeError("NF-e sem itens (<det>).");

  const hoje = new Date();
  const dataHoje = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

  const certificados: Certificado[] = dets.map((det, idx) => {
    const nItem = Number(det.getAttribute("nItem") ?? idx + 1);
    const prod = kids(det, "prod")[0];
    if (!prod) throw new NFeError(`O item ${nItem} não possui a informação <prod>.`);

    const cProd = txt(prod, "cProd");
    if (!cProd) throw new NFeError(`O item ${nItem} não possui a informação <cProd>.`);

    const xProd = txt(prod, "xProd");
    if (!xProd) throw new NFeError(`O item ${nItem} não possui a informação <xProd>.`);

    const unidade = txt(prod, "uTrib") ?? txt(prod, "uCom") ?? "";
    const qtdTotal = txt(prod, "qTrib") ?? txt(prod, "qCom") ?? "0";

    const tipo: Certificado["tipo"] = cProd.startsWith("29") ? "ribbon" : "etiqueta";

    const partes = partesDescricao(xProd);
    const trechoDim = partes[1] ?? "";
    const { largura, comprimento } = extrairDimensoes(trechoDim);
    // Ribbon: modelo = 3º trecho. Etiqueta: modelo = descrição completa.
    const modelo = tipo === "ribbon" ? (partes[2] ?? "") : xProd.trim();

    const rastros = kids(prod, "rastro");
    const lotes: Lote[] = rastros.map((r) => ({
      nLote: txt(r, "nLote") ?? "",
      qLote: formatarQuantidade(txt(r, "qLote") ?? "0"),
      dFab: txt(r, "dFab") ?? undefined,
      dVal: txt(r, "dVal") ?? undefined,
      loteFabricante: "",
    }));

    return {
      id: `${nItem}-${cProd}`,
      nItem,
      tipo,
      codigoSato: cProd,
      descricao: xProd.trim(),
      cliente,
      modelo,
      medida: trechoDim,
      largura,
      comprimento,
      etiquetasPorRolo: extrairEtqPorRolo(xProd),
      unidade,
      quantidadeTotal: formatarQuantidade(qtdTotal),
      notaFiscal: nNF,
      serie: serieEl,
      dataEmissao,
      pedidoCliente: txt(prod, "xPed") ?? "",
      pedidoSato: "",
      entintamento: "",
      emitidoPor: "Depto. da Qualidade",
      dataEmissaoCertificado: dataHoje,
/*       lotes:
        lotes.length > 0
          ? lotes
          : [{ nLote: "", qLote: formatarQuantidade(qtdTotal), loteFabricante: "" }],
      semLote: lotes.length === 0, */

      /*Alteração*/
      lotes,
      semLote: lotes.length === 0,
    };
  });

  return {
    resumo: { nNF, serie: serieEl, cliente, data: dataEmissao, itens: dets.length },
    certificados,
  };
}

export const nomeArquivo = (c: Certificado): string => {
  const lote = !c.semLote && c.lotes.length === 1 && c.lotes[0]?.nLote ? c.lotes[0].nLote : "";
  const partes = ["Certificado", c.notaFiscal, c.codigoSato, lote].filter(Boolean);
  return `${partes.join("_").replace(/[^\w.-]/g, "-")}.pdf`;
};

/* ------------------------- Validação de certificados ------------------------- */

const vazio = (v: string | undefined | null) => !v || !v.trim();

export type ValidacaoCertificado = {
  valido: boolean;
  pendencias: string[];
};

export function validarCertificado(c: Certificado): ValidacaoCertificado {
  const pendencias: string[] = [];

  if (c.tipo === "ribbon" && vazio(c.entintamento)) pendencias.push("Ent");

  if (c.lotes.length === 0) {
    pendencias.push("Lote SATO", "Quantidade");
    if (c.tipo === "ribbon") pendencias.push("Lote Fabricante");
  } else {
    c.lotes.forEach((l, i) => {
      const n = c.lotes.length > 1 ? ` (lote ${i + 1})` : "";
      if (vazio(l.nLote)) pendencias.push(`Lote SATO${n}`);
      if (vazio(l.qLote)) pendencias.push(`Quantidade${n}`);
      if (c.tipo === "ribbon" && vazio(l.loteFabricante))
        pendencias.push(`Lote Fabricante${n}`);
    });
  }

  return { valido: pendencias.length === 0, pendencias: [...new Set(pendencias)] };
}

export const isCertificadoValido = (c: Certificado): boolean => validarCertificado(c).valido;
