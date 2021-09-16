const { executeKdf } = require("@cosmjs/proto-signing");

process.on("message", async ({ password, kdfConf }) => {
  const key = await executeKdf(password, kdfConf);
  process.send(key);
});
