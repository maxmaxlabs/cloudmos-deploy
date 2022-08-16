const providerProxy = require("../providerProxy");
const fs = require("fs/promises");
const syncFs = require("fs");
const winston = require("winston");
const helpers = require("../helpers");

let socket;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.File({ filename: "electron.export.log" })]
});

process.on("message", async (value) => {
  logger.info("Exporting logs");

  if (value === "cleanup") {
    logger.info("Cleanup");
    socket?.close();
    delete socket;
    process.exit(0);
  }

  const { appPath, url, certPem, prvPem, fileName } = value;
  const dir = `${appPath}/cloudmos`;
  const filePath = `${dir}/${fileName}.txt`;
  let isFinished = false;
  let lastMessageTimestamp;

  try {
    if (!syncFs.existsSync(dir)) {
      syncFs.mkdirSync(dir);
    }

    await fs.writeFile(filePath, "", {});

    socket = providerProxy.openWebSocket(url, certPem, prvPem, (message) => {
      let parsedLog = JSON.parse(message);
      parsedLog.service = parsedLog.name.split("-")[0];
      parsedLog.message = parsedLog.service + ": " + parsedLog.message;

      syncFs.appendFileSync(filePath, `[${parsedLog.service}]: ${parsedLog.message}\n`);

      lastMessageTimestamp = Date.now();
    });
  } catch (error) {
    logger.error("An error has occured", error);
  }

  while (!isFinished) {
    await helpers.sleep(1000);

    const elapsed = Date.now() - lastMessageTimestamp;

    if (Math.floor(elapsed / 1000) > 3) {
      isFinished = true;
      socket.close();
    }
  }

  logger.info("Finished exporting");

  process.send(filePath);
});
