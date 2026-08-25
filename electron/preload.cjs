const { contextBridge, ipcRenderer } = require("electron");

// Ponte mínima e somente de leitura entre o processo principal (onde vive o
// electron-updater) e a interface React. Nenhuma requisição de rede acontece
// no renderer — ele apenas recebe eventos e envia comandos.
contextBridge.exposeInMainWorld("qcUpdater", {
  isDesktop: true,
  getStatus: () => ipcRenderer.invoke("updater:status"),
  check: () => ipcRenderer.invoke("updater:check"),
  download: () => ipcRenderer.invoke("updater:download"),
  install: () => ipcRenderer.invoke("updater:install"),
  onState: (cb) => {
    const handler = (_event, state) => cb(state);
    ipcRenderer.on("updater:state", handler);
    return () => ipcRenderer.removeListener("updater:state", handler);
  },
});
