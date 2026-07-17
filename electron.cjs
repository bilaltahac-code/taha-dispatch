const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
} = require("electron");

const fs = require("fs");
const path = require("path");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle(
  "save-pdf",
  async (event, buffer, fileName) => {
    try {
      const ordersFolder = path.join(
        app.getPath("documents"),
        "Taha Dispatch"
      );

      if (!fs.existsSync(ordersFolder)) {
        fs.mkdirSync(ordersFolder, {
          recursive: true,
        });
      }

      const safeFileName = path.basename(fileName);

      const filePath = path.join(
        ordersFolder,
        safeFileName
      );

      fs.writeFileSync(
        filePath,
        Buffer.from(buffer)
      );

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error("Failed to save PDF:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }
);

ipcMain.handle(
  "open-pdf",
  async (event, filePath) => {
    try {
      if (
        !filePath ||
        typeof filePath !== "string" ||
        !fs.existsSync(filePath)
      ) {
        return {
          success: false,
          error: "PDF file was not found",
        };
      }

      const result = await shell.openPath(filePath);

      if (result) {
        return {
          success: false,
          error: result,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to open PDF:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }
);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});