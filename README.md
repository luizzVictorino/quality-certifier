# Quality Certifier

Criar aplicação para geração automática de Certificados de Qualidade a partir de XML de NF-e 

Desenvolva uma aplicação web simples, profissional e objetiva para geração automática de Certificados de Qualidade a partir de arquivos XML de NF-e. 

A aplicação deve permitir que o usuário faça upload de um arquivo XML de NF-e, leia as informações necessárias, identifique automaticamente cada produto da nota fiscal, escolha o modelo correto de certificado e gere um PDF individual para cada item conforme as regras abaixo. 

1. Objetivo da aplicação 

O fluxo principal deve ser: 

Usuário acessa a aplicação. 

Usuário seleciona ou arrasta um arquivo XML de NF-e. 

Sistema valida e interpreta o XML. 

Sistema identifica todos os itens existentes na NF-e. 

Para cada item, extrai as informações necessárias. 

Sistema identifica se o produto é Ribbon ou Etiqueta. 

Sistema utiliza o modelo correspondente. 

Sistema preenche o modelo sem alterar sua estrutura visual. 

Gerar o certificado para cada produto

Visualização e edição das informações do certificado.

Gerar os certificados em PDF. 

Disponibilizar os PDFs para visualização e download. 

Opcionalmente, disponibilizar também um botão para gerar um único PDF consolidado contendo todos os certificados da NF. 

1. Modelos de certificado 

A aplicação terá dois modelos oficiais: 

certificado_qualidade_ribbon.docx 

certificado_qualidade_etiqueta.docx 

Os arquivos devem ser tratados como templates oficiais. 

Regra para escolha do modelo 

Para cada produto, analisar: 

<prod> 
<cProd>...</cProd> 
</prod> 
Se o código do produto começar com 29: 

Modelo = certificado_qualidade_ribbon 

Caso contrário: 

Modelo = certificado_qualidade_etiqueta 

Exemplos: 

29CA4110D1 → Ribbon 
29CA7110D1 → Ribbon 
29MA4110D1 → Ribbon 
25XB710961 → Etiqueta 
25XX730303 → Etiqueta 
25XX740161 → Etiqueta 

Essa regra deve ser aplicada automaticamente para cada item da NF-e. 

1. XML de entrada 

A aplicação deve aceitar XML padrão de NF-e, inclusive XML contendo namespace e estrutura nfeProc. 

Não assumir posições fixas no XML. 

Utilizar os nomes das tags XML para localizar as informações. 

O XML pode possuir vários: 

<det> 
e cada <det> representa um item da NF-e.

Para cada <det> gerar um certificado

Dentro de cada <det> existe: 

<prod> 
e dentro dele estão as informações do produto. 

O sistema deve processar todos os <det> existentes. 

1. Informações gerais da NF-e 

Extrair do XML: 

Número da NF 

Origem: 

<ide> 
<nNF>45257</nNF> 
</ide> 
Preencher no certificado: 

NOTA FISCAL = 45257 

Série 

Origem: 

<ide> 
<serie>0</serie> 
</ide> 
Importante: utilizar a tag <serie> para preencher o campo SÉRIE. 

Não utilizar <tpNF> para esse campo. 

Portanto: 

SÉRIE = valor de <serie> 

Data de emissão 

Origem: 

<dhEmi>2026-07-13T16:44:00-03:00</dhEmi> 

Converter para: 

13/07/2026 

O certificado deve apresentar somente a data no formato: 

DD/MM/AAAA 

1. Código SATO 

Extrair: 

<prod> 
<cProd>29CA4110D1</cProd> 
</prod> 
Preencher: 

Codigo SATO = 29CA4110D1 

Não modificar o código. 

Não remover caracteres. 

Não formatar. 

Utilizar exatamente o conteúdo de <cProd>. 

1. Cliente 

Extrair o nome do destinatário: 

<dest> 
<xNome>HP BIOPROTESES LTDA</xNome> 
</dest> 
Preencher: 

Cliente = HP BIOPROTESES LTDA 

Utilizar exclusivamente o conteúdo de <dest><xNome>. 

Não utilizar CNPJ para preencher o campo Cliente. 

1. Descrição do produto / Modelo 

A informação deve ser obtida da tag: 

<xProd> 
Por exemplo: 

<xProd>RIBBON - 110mm X 450M - CERA TDW108</xProd> 

A regra de interpretação é: 

Primeiro trecho: descrição do tipo do produto. 

Segundo trecho: largura e comprimento. 

Terceiro trecho: modelo. 

Separar a descrição utilizando o caractere -. 

Exemplo 1 

Entrada: 

RIBBON - 110mm X 450M - CERA TDW108 

Resultado: 

Largura = 110 
Comprimento = 450 
Modelo = CERA TDW108 

Exemplo 2 

Entrada: 

RIBBON - 214mm X 300M - MISTO TRX50 - TUBETE DE 279mm C/ CHANFRO 

Resultado: 

Largura = 214 
Comprimento = 300 
Modelo = MISTO TRX50 

Neste caso, ignorar tudo depois do terceiro -. 

Portanto, a regra é: 

Modelo = conteúdo entre o segundo "-" e o terceiro "-" 

Quando existir apenas dois separadores -, utilizar tudo depois do segundo -. 

1. Largura 

A largura deve ser extraída da segunda parte do <xProd>. 

Exemplo: 

RIBBON - 110mm X 450M - CERA TDW108 

Resultado: 

Largura = 110 

Outro exemplo: 

RIBBON - 214mm X 300M - MISTO TRX50 

Resultado: 

Largura = 214 

Remover a unidade mm. 

No modelo, preencher somente: 

110 

ou: 

214 

1. Comprimento 

Extrair o comprimento da segunda parte do <xProd>. 

Exemplo: 

RIBBON - 110mm X 450M - CERA TDW108 

Resultado: 

Comprimento = 450 

Remover a unidade M. 

Preencher somente o valor numérico. 

1. Unidade 

Extrair: 

<uTrib>PC</uTrib> 

Preencher: 

Unidade = PC 

Utilizar exatamente o valor de <uTrib>. 

1. Lote 

Atenção: um mesmo produto pode possuir vários elementos <rastro>. 

Exemplo: 

<rastro> 
<nLote>R260507870</nLote> 
<qLote>2.000</qLote> 
<dFab>2026-05-04</dFab> 
<dVal>2028-05-05</dVal> 
</rastro> 
<rastro> 
<nLote>R260608022</nLote> 
<qLote>3.000</qLote> 
<dFab>2026-06-13</dFab> 
<dVal>2028-06-09</dVal> 
</rastro> 
O sistema deve gerar um certificado e neste conter as informações de todos os lotes deste produto

Neste exemplo: 

Certificado 1 
Lote = R260507870 
Quantidade = 2.000 
Unidade = PC 
Lote = R260608022 
Quantidade = 3.000 
Unidade = PC 

1. Quantidade 

Extrair: 

<rastro> 
<qLote>6.000</qLote> 
</rastro> 
Preencher: 

Quantidade = 6,000 

A quantidade do certificado deve ser a quantidade do lote (qLote), e não a quantidade total do item (qCom ou qTrib), quando existir <rastro>. 

1. Lote Fabricante 

No modelo Ribbon existe também o campo: 

Lote Fabricante 

Caso o XML possua uma informação correspondente ao lote do fabricante, preencher esse campo. 

Caso não exista uma informação específica de lote fabricante no XML, não inventar informação. 

Nesse caso, deixar o campo vazio para edição


1. Tratamento de itens sem <rastro> 

Alguns produtos podem não possuir: 

<rastro> 
Nesse cenário: 

gerar somente um certificado para o item; 

utilizar a quantidade de <qTrib> ou <qCom>, conforme apropriado ao modelo;

Extrair:

<qCom>6.0000</qCom>

Quantidade = 6,000

utilizar a unidade de <uTrib>. 

O sistema deve deixar claro internamente que o item não possui lote informado. 

1. Exemplo real do XML fornecido 

Para o item: 

<det nItem="4"> 
<prod> 
<cProd>29CA4110D1</cProd> 
<xProd>RIBBON - 110mm X 450M - CERA TDW108</xProd> 
<uTrib>PC</uTrib> 
<qTrib>5.0000</qTrib> 

``` 
<rastro> 
<nLote>R260507870</nLote> 
<qLote>2.000</qLote> 
</rastro> 

<rastro> 
<nLote>R260608022</nLote> 
<qLote>3.000</qLote> 
</rastro> 
</prod> 
``` 

</det> 
O sistema deverá identificar: 

Código SATO: 29CA4110D1 
Cliente: HP BIOPROTESES LTDA 
Modelo: CERA TDW108 
Largura: 110 
Comprimento: 450 
Nota Fiscal: 45257 
Série: 0 
Data: 13/07/2026 
Unidade: PC 


Lote Sato: R260507870 
Quantidade: 2,000 
Unidade: PC 
Lote Sato: R260608022 
Quantidade: 3,000 
Unidade: PC

 

Como o código possui dois lotes, deve gerar 1 certificado especificando os dois lotes

Como o código começa com 29, deve utilizar: 

certificado_qualidade_ribbon.docx 

1. Outro exemplo 

Para: 

<cProd>25XB710961</cProd> 
<xProd>ETIQ. LISA - 96mm X 80mm X 1Crr - 1000 ETQS/RL</xProd> 

O sistema deve identificar: 

Código SATO = 25XB710961 
Tipo = Etiqueta 
Largura = 96 
Comprimento = 80 

Como o código não começa com 29, utilizar: 

certificado_qualidade_etiqueta.docx 

1. Preservação dos modelos 

Esta é uma regra crítica. 

O PDF deve respeitar visualmente os arquivos DOCX fornecidos. 

Não criar um certificado visualmente diferente do modelo. 

Preservar: 

tamanho da página; 

orientação; 

margens; 

tabelas; 

bordas; 

logotipo; 

fontes; 

tamanhos das fontes; 

espaçamentos; 

alinhamentos; 

cabeçalhos; 

rodapés; 

textos fixos; 

posição dos campos; 

estrutura das tabelas. 

A aplicação deve preencher somente as informações variáveis. 


1. Estratégia recomendada para os templates 

Criar placeholders nos DOCX, se necessário, mantendo exatamente a posição visual dos campos. 

Por exemplo: 

{{CODIGO_SATO}} 
{{CLIENTE}} 
{{MODELO}} 
{{LARGURA}} 
{{COMPRIMENTO}} 
{{NOTA_FISCAL}} 
{{SERIE}} 
{{DATA_EMISSAO}} 
{{LOTE_SATO}} 
{{LOTE_FABRICANTE}} 
{{QUANTIDADE}} 
{{UNIDADE}} 

A aplicação deve substituir esses placeholders pelos dados extraídos do XML. 

Caso seja necessário alterar os arquivos DOCX para adicionar os placeholders, fazer isso sem modificar o layout visual existente. 

1. Geração do PDF 

O processo deve ser: 

XML 
↓ 
Leitura do XML 
↓ 
Identificação dos itens 
↓ 
Identificação dos lotes 
↓ 
Escolha do template 
↓ 
Preenchimento do DOCX 
↓

Visualização e edição

↓
Conversão para PDF 
↓ 
PDF final 

Cada combinação Produto

deve resultar em um certificado independente.



1. Interface 

Criar uma interface simples e profissional. 

Tela principal: 

Cabeçalho 

Gerador de Certificados de Qualidade 

Área de upload 

Permitir: 

selecionar arquivo; 

arrastar e soltar XML; 

aceitar somente .xml. 

Exibir o nome do arquivo selecionado. 

Após leitura do XML 

Mostrar um resumo: 

NF: 45257 
Série: 0 
Cliente: HP BIOPROTESES LTDA 
Data: 13/07/2026 

Itens encontrados: 6 
Certificados a gerar: 7 

No XML de exemplo, existem 6 itens, mas o item Ribbon 29CA4110D1 possui dois lotes, portanto o deverá para este item apenas um certificado comtemplando ambos lotes. O número de certificados deverá considerar a quantidade de produtos. 

Tabela de pré-visualização 

Mostrar: 

ItemCódigoProdutoTipoLoteQuantidadeUnidadeModelo

125XB710961ETIQ.LISA...Etiqueta17307/202630RLEtiqueta

225XX730303ETIQ.LISA...Etiqueta17308/202640RLEtiqueta

325XX740161ETIQ.LISA...Etiqueta17309/20267RLEtiqueta

429CA4110D1RIBBON...RibbonR2605078702PCRibbon

429CA4110D1RIBBON...RibbonR2606080223PCRibbon

529CA7110D1RIBBON...Ribbon R2605079994PCRibbon

629MA4110D1RIBBON...RibbonR2605079696PCRibbon 

1. Botões 

Criar os seguintes botões: 

[Selecionar XML] 
[Processar XML] 
[Visualizar Certificado] 
[Gerar PDFs] 
[Baixar Todos] 

O botão "Gerar PDFs" deve ficar desabilitado enquanto o XML não for processado corretamente. 

1. Visualização 

Antes da geração definitiva, permitir visualizar cada certificado. 

O usuário deve conseguir selecionar um item e visualizar o certificado correspondente. 

A visualização deve respeitar o mesmo layout que será utilizado no PDF final.

Deve ser possível fazer a edição ao visualizar 

1. Download 

Disponibilizar: 

Baixar PDF 

para cada certificado. 

Também disponibilizar: 

Baixar todos 

Quando o usuário clicar em "Baixar todos", gerar um arquivo ZIP contendo os PDFs individuais. 

Opcionalmente, disponibilizar também: 

Gerar PDF único 

que consolide todos os certificados em um único arquivo PDF, mantendo cada certificado em sua própria página. 

1. Nome dos arquivos 

Utilizar um padrão consistente. 

Exemplo: 

Certificado_45257_29CA4110D1_R260507870.pdf 
Certificado_45257_29CA4110D1_R260608022.pdf 
Certificado_45257_29CA7110D1.pdf 
Certificado_45257_29MA4110D1_R260507969.pdf 

Para produtos sem lote, não adicionar um lote inexistente ao nome. 

1. Validações 

O sistema deve validar: 

arquivo XML válido; 

existência de NF-e; 

existência de <ide>; 

existência de <nNF>; 

existência de <serie>; 

existência de <dhEmi>; 

existência de <dest><xNome>; 

existência de pelo menos um <det>; 

existência de <prod>; 

existência de <cProd>; 

existência de <xProd>. 

Se alguma informação obrigatória estiver ausente, mostrar uma mensagem clara. 

Exemplo: 

Não foi possível gerar o certificado. 

O item 4 não possui a informação <cProd>. 

Não gerar certificados com dados incompletos silenciosamente. 

1. Tratamento da descrição 

A lógica de parsing de <xProd> deve ser robusta. 

Não assumir que sempre existirão exatamente três partes. 

Implementar: 

Caso A — padrão 

RIBBON - 110mm X 450M - CERA TDW108 

Resultado: 

Dimensão = 110mm X 450M 
Modelo = CERA TDW108 

Caso B — mais de três partes 

RIBBON - 214mm X 300M - MISTO TRX50 - TUBETE DE 279mm C/ CHANFRO 

Resultado: 

Dimensão = 214mm X 300M 
Modelo = MISTO TRX50 

Ignorar o restante. 

Caso C — espaços 

Tratar corretamente: 

RIBBON-110mm X 450M-CERA TDW108 

e: 

RIBBON - 110mm X 450M - CERA TDW108 

Remover espaços desnecessários antes/depois dos segmentos. 

1. Extração da dimensão 

A aplicação deve identificar automaticamente padrões como: 

110mm X 450M 
214mm X 300M 
110mm X 74M 
96mm X 80mm 
30mm X 70mm 
16mm X 32mm 

Extrair os dois primeiros valores dimensionais: 

largura 
comprimento 

A unidade mm e M deve ser removida do valor apresentado no campo. 

1. Arquitetura sugerida 

Utilizar uma arquitetura simples e fácil de manter. 


Bibliotecas apropriadas para: 

leitura/parsing de XML; 

manipulação de DOCX; 

substituição de placeholders; 

conversão DOCX → PDF; 

geração de ZIP. 

A conversão para PDF deve ser feita preferencialmente utilizando LibreOffice em modo headless ou outra solução confiável que preserve o layout do DOCX. 

Não depender de APIs externas para processar os documentos. 

1. Segurança e privacidade 

O XML contém informações fiscais e dados de clientes. 

Portanto: 

não enviar XML para serviços externos; 

processar os arquivos localmente no servidor; 

não armazenar os XML permanentemente; 

remover arquivos temporários após a geração dos certificados; 

validar extensão e conteúdo do arquivo; 

limitar tamanho máximo do upload. 

1. Estrutura do projeto 

/templates 
certificado_qualidade_ribbon.docx 
certificado_qualidade_etiqueta.docx 

/temp 
/output 

1. Regras fundamentais 

Não alterar estas regras: 

Regra 1 

cProd começa com 29 
→ certificado_qualidade_ribbon.docx 

Regra 2 

cProd não começa com 29 
→ certificado_qualidade_etiqueta.docx 

Regra 3 

Um <det> com vários <rastro> 
→ um certificado contendo os  <rastro> 

Regra 4 

Lote = <rastro><nLote> 

Regra 5 

Quantidade = <rastro><qLote> 

Regra 6 

Unidade = <uTrib> 

Regra 7 

Cliente = <dest><xNome> 

Regra 8 

Código SATO = <prod><cProd> 

Regra 9 

NF = <ide><nNF> 

Regra 10 

Série = <ide><serie> 

Regra 11 

Data = <ide><dhEmi> 

Converter para DD/MM/AAAA. 

Regra 12 

Largura e comprimento 

devem ser extraídos da segunda parte da descrição <xProd>. 

Regra 13 

Modelo 

deve ser extraído da terceira parte da descrição <xProd>. 

1. Critério de aceite 

A aplicação somente estará concluída quando for possível: 

Selecionar o XML. 

Processar automaticamente todos os itens. 

Identificar corretamente Ribbon x Etiqueta. 

Identificar corretamente os lotes. 

Gerar um certificado por lote. 

Preencher corretamente os campos. 

Utilizar os dois templates oficiais. 

Manter o layout original dos templates. 

Converter os certificados para PDF. 

Visualizar os certificados. 

Baixar os PDFs individualmente. 

Baixar todos os certificados em ZIP. 

Gerar opcionalmente um PDF consolidado. 

1. Teste obrigatório com o XML fornecido 

Utilizar o XML de exemplo fornecido para testar a aplicação. 

O sistema deverá identificar 6 produtos e gerar certificados conforme a quantidade de lotes existente em cada item. 

No mínimo, validar especificamente o item: 

Código: 29CA4110D1 
Descrição: RIBBON - 110mm X 450M - CERA TDW108 
Cliente: HP BIOPROTESES LTDA 
NF: 45257 
Série: 0 
Data: 13/07/2026 
Largura: 110 
Comprimento: 450 
Modelo: CERA TDW108 
Unidade: PC 

Com os dois lotes: 

R260507870 / 2,000 PC 
R260608022 / 3,000 PC 

Esse item obrigatoriamente deve gerar 1 certificado Ribbon. 

O XML fornecido contém exatamente esse cenário de múltiplos lotes no item 29CA4110D1. 

1. Resultado esperado 

O resultado final deve ser uma aplicação funcional, não apenas uma demonstração visual. 

Priorizar: 

funcionamento real; 

precisão na leitura do XML; 

preservação dos templates; 

geração correta dos certificados; 

tratamento de múltiplos lotes; 

código organizado; 

mensagens de erro claras; 

interface simples; 

processamento local dos documentos. 

Antes de considerar o projeto concluído, testar a aplicação utilizando o XML fornecido e conferir visualmente os PDFs gerados contra os dois modelos oficiais.

o certificado criado, precisar ser no mesmo padrao que o certificado fornecido. 

para etiqueta, para o modelo, incluir toda descrição do produto, exemplo, ETIQ. LISA - 105mm X 76mm X 1 Crr - 760 ETQS/RL

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/008baad2-d71b-44d2-9aec-4419c87280a3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
