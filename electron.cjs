const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);

const ordersFolder = path.join(app.getPath("documents"), "Taha Dispatch");

if (!fs.existsSync(ordersFolder)) {
  fs.mkdirSync(ordersFolder, { recursive: true });
}

ipcMain.handle("save-pdf", async (event, buffer, fileName) => {
  const filePath = path.join(ordersFolder, fileName);

  fs.writeFileSync(filePath, Buffer.from(buffer));

  return filePath;
});

ipcMain.handle("open-pdf", async (event, filePath) => {
  shell.openPath(filePath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});