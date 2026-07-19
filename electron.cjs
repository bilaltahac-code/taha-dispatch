const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
} = require("electron");

const fs = require("fs");
const path = require("path");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    autoHideMenuBar: true,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (app.isPackaged) {
    mainWindow.loadFile(
      path.join(__dirname, "dist", "index.html")
    );
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
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

      const safeFileName = path.basename(
        fileName || `order-${Date.now()}.pdf`
      );

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

ipcMain.handle(
  "save-backup",
  async (event, backupData) => {
    try {
      if (
        !backupData ||
        typeof backupData !== "object"
      ) {
        return {
          success: false,
          error: "Backup data is invalid",
        };
      }

      const now = new Date();

      const year = now.getFullYear();
      const month = String(
        now.getMonth() + 1
      ).padStart(2, "0");
      const day = String(
        now.getDate()
      ).padStart(2, "0");
      const hours = String(
        now.getHours()
      ).padStart(2, "0");
      const minutes = String(
        now.getMinutes()
      ).padStart(2, "0");

      const defaultFileName =
        `taha-dispatch-backup-${year}-${month}-${day}-${hours}-${minutes}.json`;

      const result = await dialog.showSaveDialog(
        mainWindow,
        {
          title: "שמירת גיבוי Taha Dispatch",
          defaultPath: path.join(
            app.getPath("documents"),
            defaultFileName
          ),
          filters: [
            {
              name: "Taha Dispatch Backup",
              extensions: ["json"],
            },
          ],
          properties: [
            "showOverwriteConfirmation",
            "createDirectory",
          ],
        }
      );

      if (result.canceled || !result.filePath) {
        return {
          success: false,
          canceled: true,
        };
      }

      const backupPayload = {
        appName: "Taha Dispatch",
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        data: backupData,
      };

      fs.writeFileSync(
        result.filePath,
        JSON.stringify(
          backupPayload,
          null,
          2
        ),
        "utf8"
      );

      return {
        success: true,
        filePath: result.filePath,
      };
    } catch (error) {
      console.error(
        "Failed to save backup:",
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }
);

ipcMain.handle(
  "select-backup",
  async () => {
    try {
      const result = await dialog.showOpenDialog(
        mainWindow,
        {
          title: "בחירת קובץ גיבוי",
          defaultPath: app.getPath("documents"),
          filters: [
            {
              name: "Taha Dispatch Backup",
              extensions: ["json"],
            },
          ],
          properties: ["openFile"],
        }
      );

      if (
        result.canceled ||
        !result.filePaths ||
        result.filePaths.length === 0
      ) {
        return {
          success: false,
          canceled: true,
        };
      }

      const filePath = result.filePaths[0];

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: "Backup file was not found",
        };
      }

      const fileContent = fs.readFileSync(
        filePath,
        "utf8"
      );

      const parsedBackup = JSON.parse(
        fileContent
      );

      if (
        !parsedBackup ||
        parsedBackup.appName !==
          "Taha Dispatch" ||
        parsedBackup.backupVersion !== 1 ||
        !parsedBackup.data ||
        typeof parsedBackup.data !==
          "object"
      ) {
        return {
          success: false,
          error:
            "The selected file is not a valid Taha Dispatch backup",
        };
      }

      return {
        success: true,
        filePath,
        backup: parsedBackup,
      };
    } catch (error) {
      console.error(
        "Failed to read backup:",
        error
      );

      return {
        success: false,
        error:
          error instanceof SyntaxError
            ? "Backup file contains invalid JSON"
            : error.message,
      };
    }
  }
);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});