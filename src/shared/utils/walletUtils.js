import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

var rs = require("jsrsasign");

export function getWalletAddresses() {
  return Object.keys(localStorage)
    .filter((key) => key.endsWith(".wallet"))
    .map((key) => key.replace(".wallet", ""));
}

export function deleteWalletFromStorage(address) {
  localStorage.removeItem(address + ".wallet");
  localStorage.removeItem(address + ".crt");
  localStorage.removeItem(address + ".key");

  const deploymentKeys = Object.keys(localStorage).filter((key) => key.startsWith("deployments/"));
  for (const deploymentKey of deploymentKeys) {
    localStorage.removeItem(deploymentKey);
  }
}

export async function importWallet(mnemonic, name, passphrase) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash"
  });

  const address = (await wallet.getAccounts())[0].address;

  const serializedWallet = await wallet.serialize(passphrase);
  localStorage.setItem(
    address + ".wallet",
    JSON.stringify({
      name: name,
      address: address,
      serializedWallet: serializedWallet
    })
  );

  return wallet;
}

export async function openWallet(password) {
  const walletAddress = getWalletAddresses()[0];
  const walletInfo = JSON.parse(localStorage.getItem(walletAddress + ".wallet"));
  const wallet = await DirectSecp256k1HdWallet.deserialize(walletInfo.serializedWallet, password);

  return wallet;
}

export async function openCert(address, password) {
  const certPem = localStorage.getItem(address + ".crt");
  if (!certPem) return null;

  const encryptedKeyPem = localStorage.getItem(address + ".key");

  if (!encryptedKeyPem) return null;

  const key = rs.KEYUTIL.getKeyFromEncryptedPKCS8PEM(encryptedKeyPem, password);

  return {
    certPem: certPem,
    keyPem: rs.KEYUTIL.getPEM(key, "PKCS8PRV")
  };
}
