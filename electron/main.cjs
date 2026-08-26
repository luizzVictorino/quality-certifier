const { app, BrowserWindow, protocol, net, session, dialog } = require("electron");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const { setupUpdater } = require("./updater.cjs");

const APP_NAME = "Certificado de Qualidade";
const isDev = !app.isPackaged && process.env.CQ_DEV === "1";


// ---------------------------------------------------------------------------
// Logs em %LOCALAPPDATA%\CertificadoQualidade\logs
// ---------------------------------------------------------------------------
const logDir = path.join(app.getPath("appData"), "CertificadoQualidade", "logs");f
function log(msg) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(
      path.join(logDir, "app.log"),
      `[${new Date().toISOString()}] ${msg}${os.EOL}`,
    );
  } catch {
    /* logging nunca deve derrubar o app */
  }
}

// ---------------------------------------------------------------------------
// Instância única
// ---------------------------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// ---------------------------------------------------------------------------
// Janela
// ---------------------------------------------------------------------------
const indexPath = path.join(__dirname, "..", "desktop", "dist-web", "index.html");
const appDir = path.dirname(indexPath);

// Servido por um protocolo interno (app://) porque módulos ES não carregam via file://.
const APP_ORIGIN = "app://certificado";

function isInternalUrl(url) {
  return typeof url === "string" && url.startsWith(APP_ORIGIN);
}

function registerAppProtocol() {
  protocol.handle("app", (request) => {
    const { host, pathname } = new URL(request.url);
    if (host !== "certificado") return new Response("Bloqueado", { status: 403 });
    const rel = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
    const target = path.join(appDir, path.normalize(rel));
    if (!target.startsWith(path.resolve(appDir))) {
      return new Response("Bloqueado", { status: 403 });
    }
    return net.fetch(pathToFileURL(target).toString());
  });
}

function createWindow() {
  if (!fs.existsSync(indexPath)) {
    dialog.showErrorBox(
      APP_NAME,
      "Arquivos da aplicação não encontrados. Reinstale o Certificado de Qualidade.",
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: isDev,
      webviewTag: false,
      spellcheck: false,
      preload: path.join(__dirname, "preload.cjs"),
    },

  });

  mainWindow.setMenuBarVisibility(false);
  if (!isDev) mainWindow.removeMenu();

  // Nunca abrir novas janelas/abas/navegador externo.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  // Bloquear qualquer navegação para fora dos arquivos empacotados.
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternalUrl(url)) {
      event.preventDefault();
      log(`navegação bloqueada: ${url}`);
    }
  });
  mainWindow.webContents.on("will-redirect", (event, url) => {
    if (!isInternalUrl(url)) event.preventDefault();
  });

  // Sem DevTools em produção.
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (isDev) return;
    const key = (input.key || "").toLowerCase();
    const blocked =
      key === "f12" ||
      (input.control && input.shift && ["i", "j", "c"].includes(key)) ||
      (input.control && ["r", "u", "+", "-"].includes(key));
    if (blocked) event.preventDefault();
  });
  mainWindow.webContents.on("devtools-opened", () => {
    if (!isDev) mainWindow.webContents.closeDevTools();
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(`${APP_ORIGIN}/index.html`);
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

app.whenReady().then(() => {
  registerAppProtocol();
  // Nenhuma permissão de dispositivo/rede é necessária.
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

  // Bloqueia qualquer requisição de rede externa (app é 100% local).
  // Única exceção: requisições feitas pelo PROCESSO PRINCIPAL (sem webContents)
  // para os domínios oficiais do GitHub Releases — usadas pelo electron-updater.
  const UPDATE_HOSTS = new Set([
    "github.com",
    "api.github.com",
    "objects.githubusercontent.com",
    "release-assets.githubusercontent.com",
    "codeload.github.com",
  ]);
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    let allowed =
      url.startsWith(APP_ORIGIN) || url.startsWith("data:") || url.startsWith("blob:");
    if (!allowed && details.webContentsId === undefined && url.startsWith("https://")) {
      try {
        allowed = UPDATE_HOSTS.has(new URL(url).hostname);
      } catch {
        allowed = false;
      }
    }
    if (!allowed) log(`requisição externa bloqueada: ${url}`);
    callback({ cancel: !allowed });
  });

  createWindow();

  // Atualização automática: nunca bloqueia a abertura da aplicação.
  try {
    const updater = setupUpdater(log, () => mainWindow);
    updater.checkInBackground();
  } catch (err) {
    log(`[Updater] Não foi possível iniciar: ${err && err.message ? err.message : err}`);
  }

});

// Encerramento completo: fechar a janela finaliza o processo em qualquer SO.
app.on("window-all-closed", () => {
  app.quit();
});

function shutdown() {
  try {
    for (const win of BrowserWindow.getAllWindows()) win.destroy();
  } catch {
    /* ignore */
  }
  app.quit();
}

app.on("before-quit", () => log("encerrando aplicação"));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (err) => {
  log(`erro não tratado: ${err && err.stack ? err.stack : err}`);
});
