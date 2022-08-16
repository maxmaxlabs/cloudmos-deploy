const providerProxy = require("../providerProxy");
const fs = require("fs/promises");
const syncFs = require("fs");
const winston = require("winston");
const helpers = require("../helpers");

let socket;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.File({ filename: "electron.download.log" })]
});

process.on("message", async (value) => {
  logger.info("Downloading file");

  if (value === "cleanup") {
    logger.info("Cleanup");
    socket?.close();
    delete socket;
    process.exit(0);
  }

  const { appPath, url, certPem, prvPem, fileName } = value;
  const dir = `${appPath}/cloudmos`;
  const filePath = `${dir}/${fileName}`;
  let isFinished = false;

  try {
    if (!syncFs.existsSync(dir)) {
      syncFs.mkdirSync(dir);
    }

    await fs.writeFile(filePath, "", {});

    socket = providerProxy.openWebSocket(url, certPem, prvPem, (message) => {
      const bufferData = Buffer.from(message.data.slice(1));
      const stringData = bufferData.toString("utf-8").replace(/^\n|\n$/g, "");

      // logger.info(stringData);

      let jsonData, exitCode, errorMessage;
      try {
        jsonData = JSON.parse(stringData);
        exitCode = jsonData["exit_code"];
        errorMessage = jsonData["message"];
      } catch (error) {}

      if (exitCode !== undefined) {
        if (errorMessage) {
          logger.error(`An error has occured: ${errorMessage}`);
        }

        isFinished = true;
      } else {
        syncFs.appendFileSync(filePath, bufferData);
      }
    });
  } catch (error) {
    logger.error("An error has occured", error);
  }

  while (!isFinished) {
    await helpers.sleep(1000);
  }

  logger.info("Finished downloading");

  process.send(filePath);
});
