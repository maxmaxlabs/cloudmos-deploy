const { ipcRenderer, shell, contextBridge } = require("electron");
const { fork } = require("child_process");
const providerProxy = require("./providerProxy");
const Sentry = require("@sentry/electron");
const path = require("path");

const appVersion = window.process.argv[window.process.argv.length - 2];
const appEnvironment = window.process.argv[window.process.argv.length - 1];

Sentry.init({
  dsn: "https://fc8f0d800d664154a0f1babe0e318fbb@o877251.ingest.sentry.io/5827747",
  environment: appEnvironment,
  release: appVersion
});

// whitelist channels
const validChannels = ["update_available", "update_downloaded", "download_update", "restart_app", "show_notification", "check_update"];

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
    console.log("Opening in browser: " + url);
    shell.openExternal(url);
  },
  getAppVersion: () => appVersion,
  getAppEnvironment: () => appEnvironment,
  isDev: () => {
    return new Promise((res, rej) => {
      ipcRenderer.on("isDev", (event, ...args) => {
        res(args[0]);
      });
      ipcRenderer.send("isDev");
    });
  },
  executeKdf: async (password, kdfConf) => {
    return new Promise((res, rej) => {
      const myWorker = fork(path.join(__dirname, "wallet.worker.js"), ["args"], {
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
