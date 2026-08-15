import type { Certificado } from "@/lib/nfe";
import logo from "@/assets/sato-logo.jpg";

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


function Ribbon({ c }: { c: Certificado }) {
  return (
    <>
      <h1 className="doc-titulo">CERTIFICADO DE QUALIDADE</h1>

      <table className="doc-tabela">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Codigo SATO</th>
            <th>Cliente</th>
            <th>Modelo</th>
            <th>Largura</th>
            <th>Comprimento</th>
            <th>Ent</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{c.codigoSato}</td>
            <td>{c.cliente}</td>
            <td>{c.modelo}</td>
            <td>{c.largura}</td>
            <td>{c.comprimento}</td>
            <td>{c.entrega}</td>
          </tr>
        </tbody>
      </table>

      <table className="doc-tabela">
        <thead>
          <tr>
            <th>Lote Sato</th>
            <th>Lote Fabricante</th>
            <th>Quantidade</th>
            <th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          {c.lotes.map((l, i) => (
            <tr key={i}>
              <td>{l.nLote || (c.semLote ? "—" : "")}</td>
              <td>{l.loteFabricante}</td>
              <td>{l.qLote}</td>
              <td>{c.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="doc-tabela">
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

function Etiqueta({ c }: { c: Certificado }) {
  return (
    <>
      <h1 className="doc-titulo" style={{ marginBottom: 30 }}>
        CERTIFICADO DE QUALIDADE
      </h1>

      <table className="doc-tabela doc-tabela-dados">
        <tbody>
          <tr>
            <th>Código SATO</th>
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


      <table className="doc-tabela">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Quantidade</th>
            <th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          {c.lotes.map((l, i) => (
            <tr key={i}>
              <td>{l.nLote || (c.semLote ? "—" : "")}</td>
              <td>{l.qLote}</td>
              <td>{c.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="doc-texto">
        A <strong>SATO AUTO-ID DO BRASIL</strong>, declara que o produto especificado acima esta de acordo com as
        especificações solicitadas na Ordem de Compra, o qual foi fabricado e atende os padrões de
        qualidade e requisitos técnicos.
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

export function CertificadoDoc({ c, innerRef }: { c: Certificado; innerRef?: (el: HTMLDivElement | null) => void }) {
  return (
    <div className="doc-page" ref={innerRef}>
      <Cabecalho />
      {c.tipo === "ribbon" ? <Ribbon c={c} /> : <Etiqueta c={c} />}
      <div className="doc-espaco" />
      <Rodape c={c} />
    </div>
  );
}
