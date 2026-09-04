# Certificado de Qualidade — Aplicação Desktop (Windows)

## Arquitetura

A aplicação é 100% client-side: o XML é lido, processado e o PDF é gerado dentro da própria
janela, sem servidor Node, sem backend HTTP e sem LibreOffice. Não há porta aberta, nem
processo filho, nem firewall envolvido.

```
CertificadoQualidade.exe
        │
        ▼
Runtime empacotado (Chromium/Edge engine + Node embutido no Electron)
        │
        ▼
app://certificado/index.html  (build estático em desktop/dist-web)
```

- `electron/main.cjs` — janela desktop dedicada (sem abas, sem barra de endereço, sem menus,
  sem DevTools), instância única, protocolo interno `app://` e bloqueio total de navegação
  ou requisição externa.
- `vite.desktop.config.ts` + `desktop/web/` — build estático de produção (SPA com hash history)
  reaproveitando integralmente o código atual em `src/` (upload de XML, Ribbon/Etiqueta, lotes,
  paginação, rodapé, PDF/ZIP).
- `electron-builder.yml` — empacotamento `portable` (`CertificadoQualidade.exe`) e
  instalador NSIS (`CertificadoQualidade-Setup.exe`).

## Regras de isolamento implementadas

- `will-navigate` / `will-redirect`: qualquer URL fora de `app://certificado` é bloqueada.
- `setWindowOpenHandler`: novas janelas/abas sempre negadas (nada de `window.open`).
- `webRequest.onBeforeRequest`: apenas `app://`, `data:` e `blob:` são permitidos — nenhuma
  requisição sai para a internet.
- DevTools desabilitados (`devTools: false`) e atalhos F12 / Ctrl+Shift+I bloqueados.
- Permissões de dispositivo negadas por padrão.
- Instância única (`requestSingleInstanceLock`): a segunda execução apenas foca a janela aberta.
- Fechar a janela (X, Alt+F4, encerramento do Windows) chama `app.quit()` — nenhum processo fica
  em segundo plano.
- Logs apenas em `%APPDATA%\CertificadoQualidade\logs\app.log`, sem conteúdo do XML.

## Gerar uma nova versão

Pré-requisitos na máquina de build: Node.js (já usado no desenvolvimento).

```bash
npm install
npm run build:desktop     # build estático de produção
npm run dist:win          # gera EXE portátil + instalador NSIS
```

Saída em `dist-desktop/` (configurável em `electron-builder.yml`):

```
CertificadoQualidade.exe          (portátil)
CertificadoQualidade-Setup.exe    (instalador com atalhos e desinstalação)
win-unpacked/                     (aplicação já expandida)
```

> Observação: a etapa final do instalador NSIS depende de ferramentas Windows. Ela conclui
> normalmente ao executar `npm run dist:win` em uma máquina Windows (ou em CI Windows).
> No ambiente Linux deste projeto foi gerado o pacote portátil (`win-unpacked`), publicado
> como `CertificadoQualidade-win-x64.zip`.

## Executar em computador sem Node.js

1. Copiar a pasta `win-unpacked` (ou instalar via `CertificadoQualidade-Setup.exe`).
2. Executar `CertificadoQualidade.exe`.

Não é necessário Node.js, npm, Vite, Git, Python ou código-fonte. Todo o runtime está embutido.

## Dependências externas

- Nenhuma obrigatória. O runtime de renderização acompanha o pacote.
- Não há dependência de LibreOffice: o PDF é gerado no próprio renderizador
  (`html2canvas-pro` + `jsPDF`), a partir dos modelos recriados em HTML/CSS —
  não há leitura de arquivos `.docx` em tempo de execução, portanto não existem caminhos
  absolutos de desenvolvimento.

## Teste em máquina limpa

| Teste | Procedimento | Resultado esperado |
| --- | --- | --- |
| 1 | Windows sem Node.js → executar o EXE | Aplicação abre normalmente |
| 2 | Iniciar o EXE | Janela única "Certificado de Qualidade", sem barra de endereço/abas |
| 3 | Tentar acessar sites externos | Navegação bloqueada, usuário permanece na aplicação |
| 4 | Fechar no X | Aplicação encerrada por completo |
| 5 | Gerenciador de Tarefas | Nenhum processo órfão |
| 6 | Executar o EXE duas vezes | Somente uma instância, janela existente é focada |
| 7 | Upload XML → processar → visualizar → +/- lote → gerar PDF/ZIP | Fluxo idêntico à versão web |

## Arquivos temporários

Não são criados arquivos temporários em disco: XML, páginas do certificado e PDFs são
manipulados em memória (`Blob`) e o download é feito pelo diálogo do Windows.
