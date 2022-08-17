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

  child.stdout.on("data", function (data) {});

  child.on("message", (response) => {
    if (response.type === "fetch") {
      if (response.error) {
        pendingRequests[response.id].rej(response.error);
      } else {
        pendingRequests[response.id].res(response.response);
      }
      delete pendingRequests[response.id];
    } else if (response.type === "websocket" && openSockets[response.id]) {
      // console.log("Received websocket message", response);
      openSockets[response.id].onMessage(response.message);
    }
  });

  child.on("close", (code, signal) => {
    console.error("Proxy was closed with code: " + code);
  });

  child.on("error", (err) => {
    console.error(err);
  });

  child.on("exit", (code, signal) => {
    console.error("Proxy exited with code: " + code);
  });
}
spawnProxy();

let pendingRequests = [];
let openSockets = [];

exports.openWebSocket = function (url, certPem, keyPem, onMessage) {
  const requestId = nanoid();

  // console.log("openWebSocket: ", child);

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

  // console.log("Sending websocket request: " + url);

  return {
    close: () => {
      // console.log("sending websocket_close");
      // console.log(child);
      child.send({
        id: requestId,
        type: "websocket_close"
      });
      // console.log("sent websocket_close");
      delete openSockets[requestId];
    },
    // TODO send
    send: (command) => {
      child.send({
        id: requestId,
        type: "message",
        command
      });
    }
  };
};

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
  // console.log("Querying provider using proxy");

  try {
    const response = await makeRequest(url, method, body, certPem, prvPem);

    return response;
  } catch (err) {
    console.error(err);
    // console.log("Failed to query provider with proxy");
    throw err;
  }
};

function getProxyFilePath() {
  switch (process.platform) {
    case "win32":
      return "./tools/cloudmos-provider-proxy.exe";
    case "linux":
      return "./tools/cloudmos-provider-proxy-lin";
    case "darwin":
      return "./tools/cloudmos-provider-proxy";
    default:
      throw new Error("Unsupported platform: " + process.platform);
  }
}
