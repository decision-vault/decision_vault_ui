const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('decisionVaultDesktop', {
  platform: process.platform,
  isDesktop: true,

  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  createDirectory: (dirPath) => ipcRenderer.invoke('fs:createDirectory', dirPath),
})
