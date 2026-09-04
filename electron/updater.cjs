// ---------------------------------------------------------------------------
// Atualização automática (GitHub Releases) — executa SOMENTE no processo
// principal. Se não houver internet, nada aqui impede o uso da aplicação.
// ---------------------------------------------------------------------------
const { app, ipcMain } = require("electron");

let autoUpdater = null;
try {
  ({ autoUpdater } = require("electron-updater"));
} catch (err) {
  autoUpdater = null;
}

/**
 * @param {(msg: string) => void} log
 * @param {() => Electron.BrowserWindow | null} getWindow
 */
function setupUpdater(log, getWindow) {
  const currentVersion = app.getVersion();

  /** @type {{phase: string, currentVersion: string, newVersion: string|null, percent: number, message: string|null}} */
  let state = {
    phase: "idle", // idle | checking | available | not-available | downloading | ready | error
    currentVersion,
    newVersion: null,
    percent: 0,
    message: null,
  };

  const emit = (patch) => {
    state = { ...state, ...patch, currentVersion };
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send("updater:state", state);
    }
  };

  const disabled = !autoUpdater || !app.isPackaged;

  if (!disabled) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.logger = { info: log, warn: log, error: log, debug: () => {} };

    autoUpdater.on("checking-for-update", () => {
      log(`[Updater] Verificando atualizações... (versão atual: ${currentVersion})`);
      emit({ phase: "checking", message: null });
    });

    autoUpdater.on("update-available", (info) => {
      log(`[Updater] Nova versão encontrada: ${info.version}`);
      emit({ phase: "available", newVersion: info.version, percent: 0, message: null });
    });

    autoUpdater.on("update-not-available", () => {
      log("[Updater] Nenhuma atualização encontrada.");
      emit({ phase: "not-available", newVersion: null, message: null });
    });

    autoUpdater.on("download-progress", (p) => {
      emit({ phase: "downloading", percent: Math.round(p.percent || 0) });
    });

    autoUpdater.on("update-downloaded", (info) => {
      log(`[Updater] Download concluído. Atualização ${info.version} pronta para instalação.`);
      emit({ phase: "ready", newVersion: info.version, percent: 100, message: null });
    });

    autoUpdater.on("error", (err) => {
      const detail = err && err.message ? err.message : String(err);
      log(`[Updater] Falha: ${detail}`);
      emit({
        phase: "error",
        message: "Não foi possível verificar atualizações. O aplicativo continuará funcionando normalmente.",
      });
    });
  } else {
    log("[Updater] Desativado (aplicação não empacotada ou updater indisponível).");
  }

  const check = async () => {
    if (disabled) {
      emit({ phase: "not-available" });
      return state;
    }
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      log(`[Updater] Erro ao verificar: ${err && err.message ? err.message : err}`);
      emit({
        phase: "error",
        message: "Não foi possível verificar atualizações. O aplicativo continuará funcionando normalmente.",
      });
    }
    return state;
  };

  ipcMain.handle("updater:status", () => state);
  ipcMain.handle("updater:check", async () => check());
  ipcMain.handle("updater:download", async () => {
    if (disabled) return state;
    try {
      log("[Updater] Iniciando download...");
      emit({ phase: "downloading", percent: 0, message: null });
      await autoUpdater.downloadUpdate();
    } catch (err) {
      log(`[Updater] Download interrompido: ${err && err.message ? err.message : err}`);
      emit({
        phase: "error",
        message: "O download da atualização foi interrompido. Tente novamente.",
      });
    }
    return state;
  });
  ipcMain.handle("updater:install", () => {
    if (disabled || state.phase !== "ready") return state;
    log("[Updater] Reiniciando para instalar a atualização.");
    setImmediate(() => autoUpdater.quitAndInstall(false, true));
    return state;
  });

  return {
    // Verificação automática em segundo plano, sem atrasar a abertura.
    checkInBackground: () => {
      if (disabled) return;
      setTimeout(() => {
        void check();
      }, 4000);
    },
  };
}

module.exports = { setupUpdater };
