const { ipcRenderer, shell, contextBridge } = require("electron");
const { fork } = require("child_process");
const providerProxy = require("./providerProxy");
const Sentry = require("@sentry/electron");
const path = require("path");
const fs = require("fs/promises");
const helpers = require("./helpers");

const appVersion = window.process.argv[window.process.argv.length - 2];
const appEnvironment = window.process.argv[window.process.argv.length - 1];

Sentry.init({
  dsn: "https://fc8f0d800d664154a0f1babe0e318fbb@o877251.ingest.sentry.io/5827747",
  environment: appEnvironment,
  release: appVersion
});

// whitelist channels
const validChannels = ["update_available", "update_downloaded", "download_update", "restart_app", "show_notification", "check_update", "relaunch"];

let logsWorker;

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

contextBridge.exposeInMainWorld("electron", {
  queryProvider: (url, method, body, certPem, prvPem) => providerProxy.queryProvider(url, method, body, certPem, prvPem),
  openWebSocket: (url, certPem, prvPem, onMessage) => providerProxy.openWebSocket(url, certPem, prvPem, onMessage),
  openUrl: (url) => {
    // console.log("Opening in browser: " + url);
    shell.openExternal(url);
  },
  getAppVersion: () => appVersion,
  getAppEnvironment: () => appEnvironment,
  isDev: () => ipcRenderer.invoke("isDev"),
  appPath: () => ipcRenderer.invoke("app_path"),
  openTemplateFromFile: async () => {
    const response = await ipcRenderer.invoke("dialog", "showOpenDialog", {
      title: "Select a deployment template",
      filters: [{ name: "Deployment template", extensions: ["yml", "yaml"] }],
      properties: ["openFile"]
    });
    if (response.canceled) {
      return null;
    } else {
      const path = response.filePaths[0];
      const buffer = await fs.readFile(path);
      const content = buffer.toString();

      return { path, content };
    }
  },
  downloadLogs: async (appPath, url, certPem, prvPem, fileName) => {
    return new Promise((res, rej) => {
      logsWorker = fork(path.join(__dirname, "/workers/log.worker.js"), ["args"], {
        stdio: ["pipe", "pipe", "pipe", "ipc"]
      });

      function cleanup() {
        logsWorker.kill();
        delete logsWorker;
      }

      logsWorker.on("error", (err) => {
        rej("Spawn failed! (" + err + ")");
        cleanup();
      });
      logsWorker.stderr.on("data", function (data) {
        rej(data);
        cleanup();
      });
      logsWorker.on("message", (data) => {
        res(data);
        cleanup();
      });

      logsWorker.send({ appPath, url, certPem, prvPem, fileName });
    });
  },
  cancelSaveLogs: async () => {
    logsWorker?.send("cleanup");

    await helpers.sleep(500);

    logsWorker?.kill();
    delete logsWorker;

    throw new Error("Cancelled export logs");
  },
  saveLogFile: async (filePath) => {
    const response = await ipcRenderer.invoke("dialog", "showSaveDialog", {
      title: "Save log file",
      defaultPath: filePath,
      filters: [{ name: "txt", extensions: ["txt"] }],
      buttonLabel: "Save",
      properties: []
    });
    if (response.canceled) {
      return null;
    } else {
      const path = response.filePath;

      await fs.rename(filePath, path);

      return path;
    }
  },
  executeKdf: async (password, kdfConf) => {
    return new Promise((res, rej) => {
      const myWorker = fork(path.join(__dirname, "/workers/wallet.worker.js"), ["args"], {
        stdio: ["pipe", "pipe", "pipe", "ipc"]
      });

      myWorker.on("error", (err) => {
        rej("Spawn failed! (" + err + ")");
        myWorker.kill();
      });
      myWorker.stderr.on("data", function (data) {
        rej(data);
        myWorker.kill();
      });
      myWorker.on("message", (data) => {
        res(data);
        myWorker.kill();
      });

      myWorker.send({ password, kdfConf });
    });
  },
  api: {
    send: (channel, data) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  }
});
