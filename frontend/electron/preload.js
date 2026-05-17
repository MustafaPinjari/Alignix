const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (name) => ipcRenderer.invoke("dialog:saveFile", name),
  openPath: (p) => ipcRenderer.invoke("shell:openPath", p),
});
