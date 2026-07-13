const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  savePdf: (buffer, fileName) =>
    ipcRenderer.invoke("save-pdf", buffer, fileName),

  openPdf: (filePath) =>
    ipcRenderer.invoke("open-pdf", filePath),
});