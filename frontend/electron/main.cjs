const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow;
let pythonProcess;

function startPythonBackend() {
  const backendPath = isDev
    ? path.join(__dirname, "../../backend")
    : path.join(process.resourcesPath, "backend");

  const pythonExe = isDev
    ? path.join(backendPath, "venv", "Scripts", "python.exe")
    : (process.platform === "win32" ? "python" : "python3");

  pythonProcess = spawn(pythonExe, ["main.py"], {
    cwd: backendPath,
    stdio: "pipe",
  });

  pythonProcess.stdout.on("data", (d) => console.log("[Python]", d.toString()));
  pythonProcess.stderr.on("data", (d) => console.error("[Python ERR]", d.toString()));
  pythonProcess.on("close", (code) => console.log("[Python] exited:", code));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: "#0f1117",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // Uncomment to open DevTools for debugging:
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.on("did-fail-load", () => {
    // Retry if React dev server not ready yet
    setTimeout(() => mainWindow.loadURL("http://localhost:3000"), 1000);
  });
}

app.whenReady().then(() => {
  startPythonBackend();
  setTimeout(createWindow, 1500); // wait for backend to start
});

app.on("window-all-closed", () => {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

// ── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle("window:minimize", () => mainWindow.minimize());
ipcMain.handle("window:maximize", () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle("window:close", () => {
  if (pythonProcess) pythonProcess.kill();
  app.quit();
});

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: "Word Documents", extensions: ["docx"] }],
    properties: ["openFile"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("dialog:saveFile", async (_, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: "Word Document", extensions: ["docx"] },
      { name: "PDF", extensions: ["pdf"] },
    ],
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle("shell:openPath", (_, filePath) => shell.openPath(filePath));
