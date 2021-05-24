const path = require('path')

const { nanoid } = require('nanoid');

let child = null;
function spawnProxy() {
  const spawn = require('child_process').spawn;
  const command = path.resolve('./tools/akashlytics-provider-proxy.exe');
  const parameters = [];

  child = spawn(command, parameters, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  });

  child.on('message', (response) => {
    requestResponses[response.id] = response;
  });
}
spawnProxy();

let requestResponses = [];

async function makeRequest(url, method) {
  const requestId = nanoid();

  child.send({
    id: requestId,
    url: url,
    method: method,
    certPem: localStorage.getItem("DeploymentCertificate"),
    keyPem: localStorage.getItem("DeploymentCertificatePrivateKey")
  });

  return new Promise((res, rej) => {
    const intervalTime = 300;
    let elapsedTime = 0;
    const intervalId = setInterval(() => {
      console.log("Waiting for request " + requestId);
      if (requestId in requestResponses) {
        clearInterval(intervalId);

        if (requestResponses[requestId].error) {
          rej(requestResponses[requestId].error);
        } else {
          res(requestResponses[requestId].response);
        }
        delete requestResponses[requestId];
      } else {
        elapsedTime += intervalTime;
      }
    }, intervalTime);
  });
}

exports.queryProvider = async function (url, method, body, certPem, prvPem) {
  console.log("Querying provider using proxy");

  try {
    // const response = await connection.send("queryProvider", JSON.stringify({
    //     Url: url,
    //     Method: method,
    //     Body: body,
    //     CertPem: certPem,
    //     PrvPem: prvPem
    // }));
    const response = await makeRequest(url, method);

    return response;
  } catch (err) {
    console.error(err);
    console.log("Failed to query provider with proxy");
    throw err;
  }
}