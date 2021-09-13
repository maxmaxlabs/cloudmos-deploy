const { executeKdf, DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");

process.on("message", async ({ action, password, kdfConf, mnemonic }) => {
  if (action === "deserialize") {
    const key = await executeKdf(password, kdfConf);
    process.send(key);
  } else if (action === "serialize") {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "akash"
    });
    const serializedWallet = await wallet.serialize(password);
    process.send(serializedWallet);
  }
});
