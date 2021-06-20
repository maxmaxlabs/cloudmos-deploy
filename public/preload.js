const { contextBridge, shell } = require("electron");
const providerProxy = require("./providerProxy");
const { ipcRenderer } = require("electron");

// whitelist channels
const validChannels = ["app_version", "update_available", "update_downloaded", "restart_app"];

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
  openUrl: (url) => {
    console.log("Opening in browser: " + url);
    shell.openExternal(url);
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
