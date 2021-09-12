const path = require("path");

const { nanoid } = require("nanoid");

let child = null;
function spawnProxy() {
  const spawn = require("child_process").spawn;

  const dir = __dirname.replace("asar", "asar.unpacked");
  const command = path.join(dir, getProxyFilePath());

  const parameters = [];

  child = spawn(command, parameters, {
    env: {},
    stdio: ["pipe", "pipe", "pipe", "ipc"]
  });

  child.on("message", (response) => {
    if (response.type === "fetch") {
      if (response.error) {
        pendingRequests[response.id].rej(response.error);
      } else {
        pendingRequests[response.id].res(response.response);
      }
      delete pendingRequests[response.id];
    } else if (response.type === "websocket") {
      console.log("Received websocket message", response);
      openSockets[response.id].onMessage(response.message);
    }
  });
}
spawnProxy();

let pendingRequests = [];
let openSockets = [];

exports.openWebSocket = function(url, certPem, keyPem, onMessage) {
  const requestId = nanoid();

  openSockets[requestId] = {
    onMessage: onMessage
  };

  child.send({
    id: requestId,
    type: "websocket",
    url: url,
    certPem: certPem,
    keyPem: keyPem
  });

  console.log("Sending websocket request: " + url);

  return {
    close: () => {
      child.send({
        id: requestId,
        type: "websocket_close"
      });
      delete openSockets[requestId];
    }
  };
}

async function makeRequest(url, method, body, certPem, keyPem) {
  const requestId = nanoid();

  return new Promise((res, rej) => {
    pendingRequests[requestId] = {
      res: res,
      rej: rej
    };

    child.send({
      id: requestId,
      type: "fetch",
      url: url,
      method: method,
      body: body,
      certPem: certPem,
      keyPem: keyPem
    });
  });
}

exports.queryProvider = async function (url, method, body, certPem, prvPem) {
  console.log("Querying provider using proxy");

  try {
    const response = await makeRequest(url, method, body, certPem, prvPem);

    return response;
  } catch (err) {
    console.error(err);
    console.log("Failed to query provider with proxy");
    throw err;
  }
};

function getProxyFilePath() {
  switch (process.platform) {
    case "win32":
      return "./tools/akashlytics-provider-proxy.exe";
    case "darwin":
      return "./tools/akashlytics-provider-proxy";
    default:
      throw new Error("Unsupported platform: " + process.platform);
  }
}
