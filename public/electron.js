// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification, shell, dialog } = require("electron");
const path = require("path");
const winston = require("winston");
const url = require("url");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const appVersion = app.getVersion();
const appEnv = isDev ? "development" : "production";
let startUrl = process.env.ELECTRON_START_URL;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = false;

// Set the app user model id for the notifications
app.setAppUserModelId("Cloudmos Deploy");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.File({ filename: "electron.log" })]
});

logger.info("isDev " + isDev);

logger.info("Loaded electron (app version " + appVersion + ")");

function createWindow() {
  try {
    logger.info("Creating Browser Window");
    const icon = path.join(__dirname, "icon.png");

    logger.info("icon: " + icon);

    // Create the browser window.
    const mainWindow = new BrowserWindow({
      title: "Cloudmos Deploy",
      width: 1024,
      height: 768,
      minWidth: 991,
      minHeight: 743,
      icon: icon,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        webSecurity: !isDev,
        additionalArguments: [appVersion, appEnv]
      }
    });

    //mainWindow.removeMenu();

    logger.info("Created Browser Window");

    // Open links in the browser instead of electron window
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          show: false
        }
      };
    });

    if (isDev) {
      mainWindow.webContents.openDevTools();
    } else {
      startUrl = url.format({
        pathname: path.join(__dirname, "./index.html"),
        protocol: "file:",
        slashes: true
      });
    }

    logger.info(`Start url: ${startUrl}`);

    mainWindow.loadURL(startUrl);

    // Event handlers
    // Auto update
    autoUpdater.on("update-available", (event) => {
      logger.info("update available");
      mainWindow.webContents.send("update_available", event);
    });
    autoUpdater.on("update-downloaded", (event) => {
      mainWindow.webContents.send("update_downloaded", event);
    });
    autoUpdater.on("error", (message) => {
      logger.error("There was a problem updating the application");
      logger.error(message);
    });
    // Custom events
    ipcMain.on("download_update", () => {
      autoUpdater.downloadUpdate();
    });
    ipcMain.on("restart_app", () => {
      autoUpdater.quitAndInstall();
    });
    ipcMain.handle("isDev", (event, arg) => {
      return Promise.resolve(isDev);
    });
    ipcMain.handle("dialog", (event, method, params) => {
      return dialog[method](mainWindow, params);
    });
    ipcMain.on("show_notification", (event, notif) => {
      new Notification(notif).show();
    });
    ipcMain.on("check_update", (event, notif) => {
      autoUpdater.checkForUpdatesAndNotify();
    });
    ipcMain.on("relaunch", () => {
      app.relaunch();
      app.exit();
    });
    ipcMain.handle("app_path", (event, name) => {
      return Promise.resolve(app.getPath(name));
    });
  } catch (error) {
    logger.error(error);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  logger.info("Creating window");

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
