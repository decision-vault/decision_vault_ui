const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env.DESKTOP_DEV_URL || 'http://127.0.0.1:3000'
  const distIndex = path.join(__dirname, '..', 'dist', 'index.html')

  if (fs.existsSync(distIndex) && !process.env.DESKTOP_DEV_URL) {
    win.loadFile(distIndex)
  } else {
    win.loadURL(devUrl)
  }
}

ipcMain.handle('dialog:selectFolder', async () => {
  const win = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Project Location',
    buttonLabel: 'Select Folder',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('fs:createDirectory', async (_event, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true })
    return { success: true, path: dirPath }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
