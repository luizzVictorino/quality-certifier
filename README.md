<div align="center">

![Emissão de Certificados de Qualidade](docs/images/banner.png)

# Emissão de Certificados de Qualidade

**XML NF-e → Processamento → Certificado PDF**

Automação • Rastreabilidade • Padronização

![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-1-FF4154)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4)
![PDF](https://img.shields.io/badge/PDF-jsPDF-E11D48)
![XML](https://img.shields.io/badge/XML-NF--e-6B7280)
![Status](https://img.shields.io/badge/status-em%20produção-2E7D32)

</div>

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│       EMISSÃO DE CERTIFICADOS DE QUALIDADE                   │
│                                                              │
│       XML NF-e → Processamento → Certificado PDF             │
│                                                              │
│       Automação • Rastreabilidade • Padronização             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

> ⚠️ **Aviso sobre os dados desta documentação**
> Todos os nomes de empresas, clientes, produtos, números de NF-e, lotes,
> quantidades e certificados citados neste README são **fictícios** e existem
> apenas para fins demonstrativos. Nenhum dado real de cliente, fornecedor ou
> nota fiscal é utilizado ou versionado neste repositório.

---

## 📋 Sobre o projeto

Aplicação web para **emissão automática de Certificados de Qualidade** a partir
de arquivos **XML de NF-e**.

O processo manual de emitir certificados exige recopiar dados da nota fiscal
(número, série, data, cliente, código do produto, lotes e quantidades) para um
modelo em Word, item por item, lote por lote. Isso é lento e propenso a erro de
digitação. Esta aplicação elimina essa etapa: o XML é lido, os itens e lotes são
identificados automaticamente, o modelo correto é escolhido e o certificado é
preenchido, revisado e exportado em PDF.

O sistema:

1. Recebe o XML da NF-e (upload ou arrastar e soltar).
2. Processa e valida os dados da nota.
3. Identifica os produtos (cada `<det>` da NF-e).
4. Identifica os lotes (`<rastro>`) de cada produto.
5. Seleciona automaticamente o modelo do certificado (Ribbon ou Etiqueta).
6. Preenche o certificado com os dados extraídos.
7. Permite revisão e edição antes da emissão.
8. Gera o PDF final — individual, consolidado ou em ZIP.

Todo o processamento ocorre **no navegador do usuário**: o XML não é enviado a
nenhum servidor ou serviço externo.

---

## 🎥 Demonstração

Não há vídeo de demonstração publicado. As imagens e mockups abaixo representam
o funcionamento da aplicação com dados fictícios.

### Upload de XML

Tela inicial real da aplicação:

![Upload de XML](docs/images/upload-xml.png)

```text
┌──────────────────────────────────────────────┐
│  Importar XML de NF-e                        │
│                                              │
│      ⬆  Arraste o arquivo XML aqui           │
│                     ou                       │
│            [ Selecionar arquivo ]            │
│                                              │
│  Arquivo: NFe_000123.xml                     │
│                                              │
│  [ Processar XML ]     [ Limpar ]            │
└──────────────────────────────────────────────┘
```

### XML processado

```text
NF-e: 000123        Série: 001        Data: 01/08/2026
Cliente: Empresa Demonstração Ltda.

Produtos encontrados: 2      Certificados a gerar: 2

Produto                  Código       Lote        Quantidade
RIBBON RESINA            29001234     RBN260801   25 RL
ETIQUETA TÉRMICA         21004567     ETQ260802   40 RL

[ Visualizar ]   [ Gerar PDFs ]   [ Baixar Todos ]
```

### Visualização e edição do certificado

```text
CERTIFICADO DE QUALIDADE
Certificado Nº CQ-2026-000123

Cliente:               Empresa Demonstração Ltda.
NF-e:                  000123          Série: 001
Produto:               RIBBON RESINA - 110MM X 450M
Código:                29001234
Lote:                  RBN260801
Quantidade:            25 RL
Data de Fabricação:    01/08/2026
Data de Validade:      01/08/2028

[ Editar ]  [ + Adicionar Lote ]  [ Remover Lote ]
[ Salvar alterações ]  [ Gerar PDF ]
```

### Certificado com múltiplos lotes e quebra de página

```text
PÁGINA 1                                 PÁGINA 2
────────────────────────                 ────────────────────────
Cabeçalho                                Cabeçalho

Dados do certificado                     Lote  ETQ260804   18 RL
Produto: ETIQUETA TÉRMICA                Lote  ETQ260805   22 RL
         100MM X 50MM

Lote  ETQ260801   10 RL
Lote  ETQ260802   15 RL
Lote  ETQ260803   20 RL

────────────────────────                 ────────────────────────
Rodapé                                   Rodapé
Página 1 de 2                            Página 2 de 2
```

> As capturas `docs/images/dashboard.png`, `docs/images/xml-processado.png`,
> `docs/images/visualizar-certificado.png`, `docs/images/certificado-pdf.png` e
> `docs/images/certificado-multiplos-lotes.png` ainda **não** estão versionadas.
> Os blocos acima são os placeholders correspondentes. Um painel de indicadores
> (dashboard) **não faz parte da versão atual** — está no roadmap.

---

## ✨ Principais funcionalidades

| Funcionalidade | Descrição |
| --- | --- |
| Upload XML | Importação por seleção de arquivo ou arrastar e soltar (somente `.xml`) |
| Leitura automática | Extração dos dados diretamente das tags do XML, sem posições fixas |
| Identificação de produtos | Um certificado por item (`<det>`) da NF-e |
| Identificação de lotes | Leitura das informações de rastreabilidade (`<rastro>`) |
| Seleção de modelo | Escolha automática entre certificado Ribbon e Etiqueta |
| Visualização | Preview fiel ao PDF antes da emissão |
| Edição | Ajuste de qualquer campo com confirmação em "Salvar alterações" |
| Múltiplos lotes | Adicionar e remover lotes manualmente na visualização |
| Quebra de página | Paginação automática sem cortar lotes |
| Rodapé | Rodapé fixo no fim de todas as páginas |
| PDF | Geração individual, PDF único consolidado e ZIP com todos |
| Limpar | Descarte imediato do XML e dos certificados carregados |

---

## 🔄 Fluxo da aplicação

```text
┌───────────────┐
│   XML NF-e    │
└───────┬───────┘
        ↓
┌───────────────┐
│ Processamento │
│     XML       │
└───────┬───────┘
        ↓
┌───────────────┐
│ Identificação │
│  dos produtos │
└───────┬───────┘
        ↓
┌───────────────┐
│ Identificação │
│    de lotes   │
└───────┬───────┘
        ↓
┌───────────────┐
│ Seleção do    │
│    modelo     │
└───────┬───────┘
        ↓
┌───────────────┐
│ Visualização  │
│    e revisão  │
└───────┬───────┘
        ↓
┌───────────────┐
│  Geração PDF  │
└───────────────┘
```

---

## 🛠️ Tecnologias

| Tecnologia | Finalidade no projeto |
| --- | --- |
| **React 19** | Interface e componentes do certificado |
| **TypeScript 5** | Tipagem dos dados da NF-e e dos certificados |
| **TanStack Start / Router** | Framework e roteamento baseado em arquivos |
| **Vite** | Build e servidor de desenvolvimento |
| **Tailwind CSS 4** | Estilos da interface e do layout do certificado |
| **shadcn/ui + Radix UI** | Componentes de UI (diálogos, formulários, tabelas) |
| **DOMParser (Web API)** | Parsing do XML da NF-e, com suporte a namespace e `nfeProc` |
| **html2canvas-pro** | Rasterização fiel de cada página do certificado |
| **jsPDF** | Montagem do PDF A4 (individual e consolidado) |
| **JSZip** | Empacotamento dos PDFs em arquivo ZIP |
| **Sonner** | Mensagens de sucesso e erro |

> O layout dos certificados é reproduzido em HTML/CSS a partir dos modelos
> oficiais em DOCX. **Não** há conversão DOCX→PDF via LibreOffice nem qualquer
> serviço externo de renderização na versão atual.

---

## 📁 Estrutura do projeto

```text
.
├── src/
│   ├── components/
│   │   ├── CertificadoDoc.tsx      # Layout do certificado (Ribbon/Etiqueta) + paginação
│   │   ├── EditorCertificado.tsx   # Formulário de edição e gestão de lotes
│   │   └── ui/                     # Componentes shadcn/ui
│   ├── lib/
│   │   ├── nfe.ts                  # Parsing do XML e regras de negócio
│   │   ├── pdf.ts                  # Geração de PDF (individual, único, ZIP)
│   │   └── utils.ts
│   ├── routes/
│   │   ├── __root.tsx              # Shell da aplicação
│   │   └── index.tsx               # Tela principal (upload, tabela, modais)
│   ├── assets/                     # Logotipo utilizado no certificado
│   └── styles.css                  # Design system e estilos do documento A4
├── docs/
│   └── images/                     # Imagens desta documentação
├── public/
├── package.json
└── README.md
```

---

## 🧾 Processamento do XML

A leitura usa os **nomes das tags** (namespace-safe), nunca posições fixas, e
aceita tanto `NFe` quanto o envelope `nfeProc`.

XML fictício de referência:

```xml
<ide>
    <nNF>000123</nNF>
    <serie>001</serie>
    <dhEmi>2026-08-01T09:30:00-03:00</dhEmi>
</ide>

<dest>
    <xNome>Empresa Demonstração Ltda.</xNome>
</dest>

<det nItem="1">
    <prod>
        <cProd>29001234</cProd>
        <xProd>RIBBON RESINA - 110MM X 450M</xProd>
        <qCom>25</qCom>
        <uCom>RL</uCom>
        <uTrib>RL</uTrib>

        <rastro>
            <nLote>RBN260801</nLote>
            <qLote>25</qLote>
            <dFab>2026-08-01</dFab>
            <dVal>2028-08-01</dVal>
        </rastro>
    </prod>
</det>
```

Campos extraídos:

| Campo do certificado | Origem no XML |
| --- | --- |
| Nota Fiscal | `<ide><nNF>` |
| Série | `<ide><serie>` |
| Data de emissão | `<ide><dhEmi>` → `DD/MM/AAAA` |
| Cliente | `<dest><xNome>` |
| Código SATO | `<prod><cProd>` (sem qualquer formatação) |
| Descrição / Modelo | `<prod><xProd>` |
| Largura / Comprimento | segunda parte de `<xProd>` (ex.: `110mm X 450M`) |
| Unidade | `<uTrib>` |
| Lote | `<rastro><nLote>` |
| Quantidade | `<rastro><qLote>` |

**Validações**: XML bem formado, presença de `<ide>`, `<nNF>`, `<serie>`,
`<dhEmi>`, `<dest><xNome>`, ao menos um `<det>` e, em cada item, `<prod>`,
`<cProd>` e `<xProd>`. Faltando qualquer obrigatório, é exibida mensagem clara
indicando o item — nenhum certificado é gerado com dados incompletos.

---

## 📐 Regras de geração

**Produtos** — um certificado por `<det><prod>`.

**Lotes** — obtidos de `<rastro>`; um item com vários `<rastro>` gera **um único
certificado contendo todos os lotes**.

**Quantidade** — prioridade:

```text
qLote  →  (na ausência de <rastro>)  qTrib  →  qCom
```

**Modelo do certificado** (regra de negócio configurável em `src/lib/nfe.ts`):

```text
Código iniciado por 29
        ↓
Certificado de Ribbon

Demais códigos
        ↓
Certificado de Etiqueta
```

**Descrição (`<xProd>`)** — separada por `-`, com espaços normalizados:

| Entrada | Dimensão | Modelo |
| --- | --- | --- |
| `RIBBON RESINA - 110MM X 450M - RESINA TR100` | `110MM X 450M` | `RESINA TR100` |
| `RIBBON - 214mm X 300M - MISTO TRX50 - TUBETE` | `214mm X 300M` | `MISTO TRX50` |

As unidades `mm` e `M` são removidas dos campos Largura e Comprimento. Para
etiquetas, o campo Modelo recebe a descrição completa do produto.

---

## 📄 Exemplo de certificado (fictício)

```text
SATO Quality Systems                       CERTIFICADO DE QUALIDADE
                                           Certificado Nº CQ-2026-000123

Cliente        Empresa Demonstração Ltda.
NF-e           000123                Série  001      Data  01/08/2026
Produto        RIBBON RESINA - 110MM X 450M
Código         29001234              Unidade  RL
Largura        110                   Comprimento  450

Lote            Lote Fabricante      Quantidade    Unidade
RBN260801       —                    25            RL

Informações de qualidade: material inspecionado e aprovado conforme
os procedimentos internos de controle de qualidade.

────────────────────────────────────────────────────────────────
Emitido por: __________________        Data: 01/08/2026
                                             Página 1 de 2
```

---

## 📑 Quebra de página

Certificados com muitos lotes são paginados automaticamente:

- o conteúdo é dividido em quantas páginas A4 forem necessárias;
- as margens do modelo original são respeitadas;
- o cabeçalho segue o modelo;
- o rodapé aparece em **todas** as páginas, sempre ao pé da folha;
- nenhum lote é cortado entre páginas — cada lote permanece inteiro;
- os textos de declaração migram para uma nova página quando não couberem.

Funcionamento interno: antes de renderizar, o componente mede as alturas reais
de cabeçalho, bloco de dados, linha de lote, textos e rodapé; calcula a área
útil da página (altura A4 − margens − rodapé reservado) e distribui os lotes
sequencialmente, abrindo nova página sempre que o próximo lote não couber
integralmente. Cada página resultante vira uma página do PDF.

---

## ⚙️ Instalação

Projeto único (frontend), sem backend separado.

```sh
git clone <repositorio>
cd <projeto>

npm install
```

Requisito: Node.js 20+ e npm.

## 🔧 Configuração

A aplicação **não exige variáveis de ambiente** para funcionar: todo o
processamento é local, no navegador. Caso o deploy precise de ajustes, use um
arquivo `.env` com placeholders:

```env
PORT=8080
NODE_ENV=development
```

Nunca versione senhas, tokens, chaves de API, credenciais, strings de conexão
ou arquivos XML de clientes. Mantenha `.env` fora do controle de versão.

## ▶️ Execução

```sh
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualização do build
npm run lint     # análise estática
```

Em desenvolvimento a aplicação fica disponível em `http://localhost:8080`.

---

## 🖱️ Utilização

```text
1.  Acesse a aplicação.
2.  Selecione (ou arraste) o XML da NF-e — ex.: NFe_000123.xml.
3.  Clique em "Processar XML".
4.  Confira o resumo: NF-e 000123, Série 001, Empresa Demonstração Ltda.
5.  Confira os produtos e lotes identificados na tabela.
6.  Clique em "Visualizar" no item desejado.
7.  Faça os ajustes necessários nos campos do certificado.
8.  Adicione ou remova lotes, se necessário.
9.  Clique em "Salvar alterações".
10. Clique em "Gerar PDFs" e confira o certificado.
11. Baixe o PDF individual, o PDF único consolidado ou o ZIP com todos.
12. Use "Limpar" para descartar o XML e recomeçar.
```

Padrão de nome dos arquivos gerados:

```text
Certificado_000123_29001234_RBN260801.pdf
Certificado_000123_21004567_ETQ260802.pdf
```

Para itens sem lote, o sufixo do lote não é adicionado.

---

## 🔒 Segurança

Implementado nesta versão:

- **Processamento 100% local** — o XML é lido no navegador; nenhum arquivo é
  enviado a servidor ou serviço externo.
- **Sem armazenamento** — os dados existem apenas na memória da sessão e são
  descartados ao clicar em "Limpar" ou recarregar a página.
- **Validação do arquivo** — extensão `.xml`, limite de tamanho no upload e
  validação de conteúdo/estrutura da NF-e antes do processamento.
- **Tratamento de erros** — mensagens claras indicando o item e o campo ausente,
  sem geração silenciosa de certificados incompletos.
- **Repositório sem dados sensíveis** — nenhum XML real, certificado real ou
  credencial é versionado.

Recomendações (não implementadas no código):

- Restringir o acesso à aplicação publicada a usuários autorizados.
- Servir a aplicação exclusivamente por HTTPS.
- Definir política de retenção dos PDFs baixados nas estações de trabalho.
- Manter eventuais chaves de integração futuras em variáveis de ambiente.

---

## 🗂️ Estrutura de dados

Modelo interno de um certificado (`src/lib/nfe.ts`), com valores fictícios:

```ts
type Lote = {
  nLote: string;           // "RBN260801"
  qLote: string;           // "25"
  dFab?: string;           // "01/08/2026"
  dVal?: string;           // "01/08/2028"
  loteFabricante: string;  // "" quando não informado no XML
};

type Certificado = {
  id: string;
  nItem: number;                    // 1
  tipo: "ribbon" | "etiqueta";      // "ribbon"
  codigoSato: string;               // "29001234"
  descricao: string;                // "RIBBON RESINA - 110MM X 450M"
  cliente: string;                  // "Empresa Demonstração Ltda."
  modelo: string;                   // "RESINA TR100"
  medida: string;                   // "110MM X 450M"
  largura: string;                  // "110"
  comprimento: string;              // "450"
  etiquetasPorRolo: string;
  unidade: string;                  // "RL"
  quantidadeTotal: string;          // "25"
  notaFiscal: string;               // "000123"
  serie: string;                    // "001"
  dataEmissao: string;              // "01/08/2026"
  pedidoCliente: string;
  pedidoSato: string;
  entrega: string;
  emitidoPor: string;
  dataEmissaoCertificado: string;   // data de emissão do certificado
  lotes: Lote[];
  semLote: boolean;                 // true quando o item não possui <rastro>
};
```

Resumo da NF-e exibido após o processamento:

```ts
type NFeResumo = {
  nNF: string;     // "000123"
  serie: string;   // "001"
  cliente: string; // "Empresa Demonstração Ltda."
  data: string;    // "01/08/2026"
  itens: number;   // 2
};
```

---

## 🚀 Roadmap

- [x] Upload de XML (seleção e arrastar e soltar)
- [x] Processamento e validação automáticos
- [x] Identificação de produtos
- [x] Identificação de lotes
- [x] Seleção automática do modelo (Ribbon / Etiqueta)
- [x] Visualização do certificado
- [x] Edição dos campos com "Salvar alterações"
- [x] Adicionar e remover lotes manualmente
- [x] Quebra automática de página com rodapé em todas as páginas
- [x] Geração de PDF individual, PDF único e ZIP
- [x] Limpar dados importados
- [ ] Histórico de certificados emitidos
- [ ] Busca por NF-e
- [ ] Dashboard de indicadores
- [ ] Assinatura digital
- [ ] Integração com ERP
- [ ] Controle de usuários e permissões

---

## 🤝 Contribuição

1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b feature/minha-melhoria`.
3. Implemente a alteração e rode `npm run lint`.
4. Faça o commit: `git commit -m "feat: minha melhoria"`.
5. Abra um Pull Request descrevendo o comportamento antes e depois.

Ao reportar problemas, **não anexe XMLs reais de NF-e**. Utilize um arquivo
anonimizado com dados fictícios.

---

## 📄 Licença

Software de uso interno. Todos os direitos reservados ao detentor do projeto.
Consulte o responsável antes de redistribuir.
